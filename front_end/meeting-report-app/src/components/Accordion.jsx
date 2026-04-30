import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Accordion Component
 */
function Accordion({ items }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === index ? -1 : index)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-smooth text-left"
          >
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <ChevronDown
              className={`w-5 h-5 text-slate-500 transition-transform ${expanded === index ? 'rotate-180' : ''}`}
            />
          </button>
          {expanded === index && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-slate-700">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Accordion;
