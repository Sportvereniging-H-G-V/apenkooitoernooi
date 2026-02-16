import { z } from 'zod';

export const teamForm = z.object({
  formId: z.literal('team'),
  teamnaam: z.string().min(2),
  contactNaam: z.string().min(2),
  email: z.string().email(),
  tel: z.string().min(6),
  leeftijdsgroep: z.enum(['4-5', '6', '7-8']),
  deelnemers: z.array(z.string().min(2)).min(6).max(10),
  opmerkingen: z.string().optional(),
  aanmelding_type: z.string().optional(),
  agree: z.literal(true)
});

export const contactForm = z.object({
  formId: z.literal('contact'),
  naam: z.string().min(2),
  email: z.string().email(),
  bericht: z.string().min(10),
  agree: z.literal(true)
});
