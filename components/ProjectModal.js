'use client';

import { useEffect } from 'react';
import Icon from './Icon';

export function ProjectShot({ project, index = 0 }) {
  if (project.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={project.image} alt={project.title} loading="lazy" draggable={false} />;
  }
  return (
    <div className={'shot-placeholder tone-' + (index % 4)}>
      <span>{project.client || project.title}</span>
    </div>
  );
}

export default function ProjectModal({ project, index, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
        <div className="modal-shot">
          <ProjectShot project={project} index={index} />
        </div>
        <div className="modal-body">
          <p className="tag">{[project.category, project.year].filter(Boolean).join(' / ')}</p>
          <h2>{project.title}</h2>
          {project.client && <p className="modal-client">Client: {project.client}</p>}
          <p>{project.description}</p>
          {project.tags?.length > 0 && (
            <ul className="chips">
              {project.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {project.url && (
            <a className="btn btn-accent" href={project.url} target="_blank" rel="noopener noreferrer">
              Visit live website <Icon name="external" size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
