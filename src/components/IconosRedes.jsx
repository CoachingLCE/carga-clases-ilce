// Iconos SVG simples de cada red, con su color de marca — reemplazan los emoji genéricos
// (📷, 📘, etc.) por algo que se reconoce de un vistazo como la red real.

export function IconoInstagram({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#F56040" />
          <stop offset="75%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.3" cy="6.7" r="1.3" fill="white" />
    </svg>
  );
}

export function IconoFacebook({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3C16 5.2 15.1 5 14 5c-2.2 0-3.7 1.3-3.7 3.8v2.2H7.9v2.8h2.4V21h3.2z"
        fill="white"
      />
    </svg>
  );
}

export function IconoWhatsapp({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path
        d="M12 6.2c-3.2 0-5.8 2.6-5.8 5.8 0 1 .3 2 .8 2.9l-.9 3.1 3.2-.8c.8.4 1.7.7 2.7.7 3.2 0 5.8-2.6 5.8-5.8s-2.6-5.9-5.8-5.9zm3.4 8.3c-.1.4-.8.7-1.1.8-.3 0-.6.1-1.9-.4-1.6-.6-2.6-2.3-2.7-2.4-.1-.1-.6-.8-.6-1.6s.4-1.1.5-1.3c.1-.1.3-.2.5-.2h.4c.1 0 .3 0 .5.4l.5 1.3c.1.1.1.3 0 .4l-.3.4c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.8 1.1.2.1.3.1.4-.1l.4-.5c.2-.2.3-.2.5-.1l1.1.5c.2.1.3.1.4.2 0 .1 0 .5-.1.9z"
        fill="white"
      />
    </svg>
  );
}

export function IconoLinkedin({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <path
        d="M7.6 9.8H5v8h2.6v-8zM6.3 8.6c.9 0 1.4-.6 1.4-1.3 0-.8-.5-1.3-1.4-1.3-.8 0-1.4.5-1.4 1.3 0 .7.6 1.3 1.4 1.3zM19 12.9c0-2.4-1.3-3.5-3-3.5-1.4 0-2 .8-2.3 1.3V9.8H11v8h2.6v-4.5c0-.4 0-.8.2-1.1.3-.7.9-1.4 1.9-1.4 1.3 0 1.8 1 1.8 2.5v4.5H20v-4.9h-1z"
        fill="white"
      />
    </svg>
  );
}
