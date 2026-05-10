import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Link2,
  FileAudio,
  ClipboardCopy,
  Trash2,
  CloudUpload,
  Sparkles,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useYouTubeUrlValidator, useScrollToTop } from '../hooks/useCustom';
import {
  processYouTubeVideo,
  processLocalMediaFile,
  processTextNotes,
  downloadReportDocx,
  getReportStatus,
} from '../services/api';

const MEDIA_EXTENSIONS = ['.mp3', '.wav', '.mp4', '.mov'];
const MAX_NOTE_CHARACTERS = 2200;
const FILE_ACCEPT = '.mp3,.wav,.mp4,.mov';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadPage() {
  useScrollToTop();
  const fileInputRef = useRef(null);

  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState('');
  const [reportId, setReportId] = useState(null);
  const [backendStatus, setBackendStatus] = useState('idle');
  const [backendStep, setBackendStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Prêt à générer');
  const [reportText, setReportText] = useState('');
  const [latestPayload, setLatestPayload] = useState(null);
  const pollerRef = useRef(null);
  const pollingInFlightRef = useRef(false);
  const isMountedRef = useRef(true);

  const { isValid } = useYouTubeUrlValidator(url);
  const hasUrl = url.trim().length > 0 && isValid;
  const hasText = notes.trim().length > 0;
  const hasFile = Boolean(selectedFile);

  const sourcePriority = useMemo(() => {
    if (hasFile) return 'file';
    if (hasUrl) return 'url';
    if (hasText) return 'text';
    return '';
  }, [hasFile, hasUrl, hasText]);

  const activeSourceLabel = useMemo(() => {
    if (sourcePriority === 'file') return 'Fichier uploadé';
    if (sourcePriority === 'url') return 'Lien YouTube';
    if (sourcePriority === 'text') return 'Texte brut';
    return 'Aucune source sélectionnée';
  }, [sourcePriority]);

  const clearMessages = () => {
    setError('');
    setInfoMessage('');
  };

  const stopPolling = () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, []);

  const startProgress = () => {
    setProgress(10);
    setProgressLabel('Initialisation...');
  };

  const updateProgress = (value, label) => {
    setProgress(value);
    if (label) {
      setProgressLabel(label);
    }
  };

  const endProgress = () => {
    setProgress(100);
    setProgressLabel('Terminé');
  };

  const isSupportedFile = (file) => {
    if (!file) return false;
    const extension = file.name.toLowerCase().split('.').pop();
    return MEDIA_EXTENSIONS.includes(`.${extension}`);
  };

  const handleFileSelect = (file) => {
    clearMessages();

    if (!file) return;
    if (!isSupportedFile(file)) {
      setError('Type de fichier non supporté. Utilisez mp3, wav, mp4 ou mov.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const droppedFile = event.dataTransfer?.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const buildPayload = (source) => {
    const payload = {};
    if (source === 'file' && selectedFile) {
      payload.file = selectedFile;
    }
    if (source === 'url' && hasUrl) {
      payload.url = url.trim();
    }
    if (source === 'text' && hasText) {
      payload.text = notes.trim();
    }
    return payload;
  };

  const handleSubmit = async (event, sourceOverride) => {
    if (event) {
      event.preventDefault();
    }
    if (isLoading) {
      return;
    }

    clearMessages();
    const source = sourceOverride || sourcePriority;

    if (!source) {
      setError('Veuillez entrer un lien YouTube, téléverser un fichier ou coller du texte.');
      return;
    }

    if (source === 'url' && !hasUrl) {
      setError('Veuillez saisir une URL YouTube valide.');
      return;
    }

    if (source === 'file' && !hasFile) {
      setError('Veuillez sélectionner un fichier audio ou vidéo pris en charge.');
      return;
    }

    if (source === 'text' && !hasText) {
      setError('Veuillez ajouter du texte avant de générer le rapport.');
      return;
    }

    let keepLoading = false;
    try {
      setIsLoading(true);
      setLoadingSource(source);
      startProgress();
      updateProgress(25, 'Connexion au backend...');

      let response;
      if (source === 'file') {
        response = await processLocalMediaFile(selectedFile);
      } else if (source === 'url') {
        response = await processYouTubeVideo(url.trim());
      } else {
        response = await processTextNotes(notes.trim());
      }

      if (!response || response.success === false) {
        throw new Error(response?.error || 'Erreur lors de la génération du rapport.');
      }
      if (!response?.report_id) {
        throw new Error('Aucun report_id retourné par le backend.');
      }

      setLatestPayload(response);
      setReportId(response.report_id);
      setBackendStatus('processing');
      setBackendStep(response.step || 'uploading');
      setInfoMessage('Traitement lancé. Génération du rapport en arrière-plan...');
      updateProgress(35, response.message || 'Processing your meeting...');
      keepLoading = true;

      stopPolling();
      pollerRef.current = setInterval(async () => {
        if (pollingInFlightRef.current) {
          return;
        }
        pollingInFlightRef.current = true;
        try {
          const statusData = await getReportStatus(response.report_id);
          console.log('Current backend status:', statusData?.status, 'step:', statusData?.step);
          if (!isMountedRef.current) {
            return;
          }
          if (statusData?.status === 'processing') {
            setBackendStatus('processing');
            setBackendStep(statusData?.step || '');
            setProgress((prev) => Math.min(prev + 5, 90));
            setProgressLabel(statusData?.message || 'Processing your meeting...');
            return;
          }
          if (statusData?.status === 'completed') {
            stopPolling();
            setBackendStatus('completed');
            setBackendStep(statusData?.step || 'finished');
            const fullReport = statusData.report || {};
            setLatestPayload({ report_id: response.report_id, reportId: response.report_id });
            setReportText(fullReport.summary || 'Rapport généré avec succès.');
            endProgress();
            setInfoMessage(statusData?.message || 'Rapport généré. Vous pouvez le télécharger en PDF.');
            setIsLoading(false);
            setLoadingSource('');
            return;
          }
          if (statusData?.status === 'error') {
            stopPolling();
            setBackendStatus('error');
            setBackendStep(statusData?.step || 'error');
            setError(statusData?.message || 'Erreur pendant le traitement du rapport.');
            setProgress(0);
            setProgressLabel('Erreur');
            setIsLoading(false);
            setLoadingSource('');
          }
        } catch (pollErr) {
          if (!isMountedRef.current) {
            return;
          }
          stopPolling();
          setBackendStatus('error');
          setBackendStep('error');
          setError(pollErr?.message || 'Erreur de suivi du traitement.');
          setProgress(0);
          setProgressLabel('Erreur');
          setIsLoading(false);
          setLoadingSource('');
        } finally {
          pollingInFlightRef.current = false;
        }
      }, 5000);
    } catch (err) {
      setBackendStatus('error');
      setBackendStep('error');
      setError(err?.message || 'Impossible de traiter votre demande.');
      setReportText('');
      setProgress(0);
      setProgressLabel('Erreur');
    } finally {
      if (!keepLoading) {
        setIsLoading(false);
        setLoadingSource('');
      }
    }
  };

  const handleDownload = async () => {
    clearMessages();

    if (backendStatus !== 'completed') {
      setError('Le rapport n’est pas encore prêt pour le téléchargement.');
      return;
    }

    if (!latestPayload) {
      setError('Aucun rapport disponible pour téléchargement.');
      return;
    }

    try {
      setIsLoading(true);
      startProgress();
      updateProgress(35, 'Préparation du DOCX...');

      const blob = await downloadReportDocx(latestPayload);
      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObject;
      link.download = 'compte_rendu.docx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlObject);
      endProgress();
      setInfoMessage('Téléchargement du DOCX lancé.');
    } catch (err) {
      setError(err?.message || 'Impossible de télécharger le fichier DOCX.');
      setProgress(0);
      setProgressLabel('Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-none">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white shadow-soft-lg">
                <Sparkles className="h-6 w-6" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Auto Report Generator</p>
                  <h1 className="text-3xl font-semibold sm:text-4xl">Générez votre rapport de réunion</h1>
                </div>
              </div>
              <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                Collez un lien YouTube, téléversez un fichier audio/vidéo ou collez du texte de réunion. ARG s'occupe du reste.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Source active</p>
              <p className="mt-2 text-lg font-semibold">{activeSourceLabel}</p>
              {hasFile && <p className="text-sm text-slate-500 dark:text-slate-400">Le fichier uploadé a la priorité.</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600">
                  <Link2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">URL YouTube</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Collez le lien</h2>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={(event) => handleSubmit(event, 'url')}>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <label htmlFor="youtube-url" className="sr-only">URL YouTube</label>
                  <input
                    id="youtube-url"
                    type="url"
                    value={url}
                    onChange={(event) => {
                      setUrl(event.target.value);
                      clearMessages();
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 outline-none ring-0 dark:text-slate-100"
                  />
                </div>

                {url.trim() && (
                  <div className={`flex items-center gap-2 text-sm ${isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span>{isValid ? 'URL YouTube valide' : 'URL YouTube invalide'}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading && loadingSource === 'url'}
                  disabled={!isValid || isLoading}
                  className="w-full"
                >
                  {isLoading && loadingSource === 'url' ? 'Traitement...' : 'Générer le rapport'}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-600">
                  <FileAudio className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Fichier local</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Audio & vidéo</h2>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={handleChooseFile}
                onKeyDown={(event) => event.key === 'Enter' && handleChooseFile()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`mt-6 rounded-[1.75rem] border-2 border-dashed p-8 text-center transition ${
                  dragActive ? 'border-blue-400 bg-blue-50/50 dark:border-cyan-400 dark:bg-cyan-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'
                }`}
              >
                <CloudUpload className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Glisser-déposer un fichier</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Supports mp3, wav, mp4, mov</p>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Ou cliquez pour choisir</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={FILE_ACCEPT}
                  onChange={(event) => handleFileSelect(event.target.files?.[0])}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Fichier sélectionné</p>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedFile(null)}>
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={isLoading && loadingSource === 'file'}
                disabled={!hasFile || isLoading}
                onClick={(event) => handleSubmit(event, 'file')}
                className="mt-6 w-full"
              >
                {isLoading && loadingSource === 'file' ? 'Téléversement...' : 'Traiter le fichier'}
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900/10 text-slate-900 dark:bg-slate-200/10 dark:text-slate-200">
                  <ClipboardCopy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Texte brut</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Collez vos notes</h2>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                <textarea
                  value={notes}
                  onChange={(event) => {
                    const rawValue = event.target.value;
                    if (rawValue.length <= MAX_NOTE_CHARACTERS) {
                      setNotes(rawValue);
                    }
                    clearMessages();
                  }}
                  placeholder="Collez ici un extrait de réunion, des notes ou un transcript..."
                  className="min-h-[220px] w-full resize-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Supports rich meeting summaries and action item generation.</span>
                  <span>{notes.length}/{MAX_NOTE_CHARACTERS}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={isLoading && loadingSource === 'text'}
                disabled={!hasText || isLoading}
                onClick={(event) => handleSubmit(event, 'text')}
                className="mt-6 w-full"
              >
                {isLoading && loadingSource === 'text' ? 'Génération en cours...' : 'Générer à partir du texte'}
              </Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="space-y-5 rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-xl shadow-slate-200/40 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Workflow intelligent</p>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Un seul écran, tout est centralisé</h3>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Détection automatique de la meilleure source</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Priorité : fichier → lien YouTube valide → texte.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Connexion au backend FastAPI</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Le formulaire envoie les données réelles à l'API ARG.</p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Téléchargement DOCX</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Après génération, récupérez votre rapport Word.</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/40 dark:border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-slate-950">
                    <FileAudio className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Meeting intelligence</p>
                    <h3 className="text-xl font-semibold">Passer du contenu à l’action</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  Obtenez un rapport clair, structuré et prêt à partager, directement depuis une vidéo ou vos notes.
                </p>
                <div className="grid gap-3 text-sm text-slate-200">
                  <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Décisions et actions extraites automatiquement</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>Export DOCX disponible</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {(isLoading || progress > 0) && (
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Progrès</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{progressLabel}</p>
                {reportId && <p className="text-xs text-slate-500 dark:text-slate-400">Report ID: {reportId}</p>}
                {backendStep && <p className="text-xs text-slate-500 dark:text-slate-400">Step: {backendStep}</p>}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{progress}%</p>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 mt-4 dark:bg-slate-800">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        )}

        {reportText && (
          <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-950">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Compte rendu</p>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Rapport généré</h2>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleDownload}
                  isLoading={isLoading && backendStatus !== 'completed'}
                  disabled={backendStatus !== 'completed' || !latestPayload}
                >
                  Télécharger .docx
                </Button>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 whitespace-pre-line">
                {reportText}
              </div>
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/80 dark:text-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 px-6 py-4 text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/80 dark:text-blue-200">
            <p>{infoMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
