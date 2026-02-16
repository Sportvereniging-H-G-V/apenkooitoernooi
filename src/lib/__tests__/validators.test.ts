import { describe, it, expect } from 'vitest';
import { teamForm } from '../validators';

describe('Team Form Validator', () => {
  it('should validate a correct team form', () => {
    const validTeamData = {
      formId: 'team' as const,
      teamnaam: 'Team Apenkooi',
      contactNaam: 'Jan Jansen',
      email: 'jan@example.com',
      tel: '0612345678',
      leeftijdsgroep: '6' as const,
      deelnemers: ['Jan', 'Piet', 'Klaas', 'Marie', 'Lisa', 'Tom'],
      opmerkingen: 'Leuk team!',
      agree: true
    };

    const result = teamForm.safeParse(validTeamData);
    expect(result.success).toBe(true);
  });

  it('should reject team form with invalid email', () => {
    const invalidTeamData = {
      formId: 'team' as const,
      teamnaam: 'Team Apenkooi',
      contactNaam: 'Jan Jansen',
      email: 'invalid-email',
      tel: '0612345678',
      leeftijdsgroep: '6' as const,
      deelnemers: ['Jan', 'Piet', 'Klaas', 'Marie', 'Lisa', 'Tom'],
      agree: true
    };

    const result = teamForm.safeParse(invalidTeamData);
    expect(result.success).toBe(false);
  });

  it('should reject team form with too few deelnemers', () => {
    const invalidTeamData = {
      formId: 'team' as const,
      teamnaam: 'Team Apenkooi',
      contactNaam: 'Jan Jansen',
      email: 'jan@example.com',
      tel: '0612345678',
      leeftijdsgroep: '6' as const,
      deelnemers: ['Jan', 'Piet'], // Too few
      agree: true
    };

    const result = teamForm.safeParse(invalidTeamData);
    expect(result.success).toBe(false);
  });
});
