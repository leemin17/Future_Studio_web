import { motion } from 'framer-motion';
import { contactLinks as fallbackContactLinks } from '@shared/fallbackData';
import type { ContactLink } from '@shared/types';
import type { JSX } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

const contactIcons: Record<ContactLink['icon'], JSX.Element> = {
  instagram: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" />
      </svg>
  ),
  gmail: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
  ),
  facebook: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1z" />
      </svg>
  ),
  phone: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h4l2 5-3 2c1.3 2.7 3.3 4.7 6 6l2-3 5 2v4c0 1.1-.9 2-2 2C10.5 22 2 13.5 2 3c0-1.1.9-2 2-2h3v3z" />
      </svg>
  ),
  location: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
  ),
};

const ContactPage: React.FC = () => {
  const contactLinks = useSiteContent<ContactLink[]>('contact_links', fallbackContactLinks);
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <motion.p
          className="contact-kicker"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Future Studio Contact
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          Reach us through the channels below.
        </motion.h1>
      </section>

      <section className="contact-body contact-body--simple">
        <motion.div
          className="contact-card contact-card--info"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="contact-card-number">Contact information</span>
          <h2>Future Studio</h2>

          <div className="contact-link-list">
            {contactLinks.map((item) => (
              <a key={item.label} href={item.href} className="contact-link-item" target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <i className="contact-link-icon">{contactIcons[item.icon]}</i>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </a>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ContactPage;
