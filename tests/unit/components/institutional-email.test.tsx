import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { InstitutionalEmail, institutionalAlias } from '@/components/institutional-email';

// ---------------------------------------------------------------------------
// UNIT — institutionalAlias(): generación del alias (función pura, muchas ramas)
// ---------------------------------------------------------------------------
describe('institutionalAlias', () => {
  it('genera nombre.apellido@dominio desde el nombre completo', () => {
    expect(institutionalAlias('Ana Torres')).toBe('ana.torres@especialistas.neuroalert.pe');
  });

  it('usa solo el primer nombre cuando no hay apellido', () => {
    expect(institutionalAlias('Ana')).toBe('ana@especialistas.neuroalert.pe');
  });

  it('quita tildes y diacríticos', () => {
    expect(institutionalAlias('José Núñez')).toBe('jose.nunez@especialistas.neuroalert.pe');
  });

  it('toma el primer y el último token cuando hay nombres compuestos', () => {
    expect(institutionalAlias('María Del Carmen Rojas')).toBe(
      'maria.rojas@especialistas.neuroalert.pe',
    );
  });

  it('cae a "especialista" con entrada vacía, nula o indefinida', () => {
    const expected = 'especialista@especialistas.neuroalert.pe';
    expect(institutionalAlias('')).toBe(expected);
    expect(institutionalAlias(null)).toBe(expected);
    expect(institutionalAlias(undefined)).toBe(expected);
  });

  it('descarta caracteres no alfanuméricos del local-part', () => {
    expect(institutionalAlias('Ana!! Torres##')).toBe('ana.torres@especialistas.neuroalert.pe');
  });
});

// ---------------------------------------------------------------------------
// UNIT — InstitutionalEmail: render en variante completa y compacta
// ---------------------------------------------------------------------------
describe('InstitutionalEmail', () => {
  it('muestra el alias y el texto explicativo en variante completa', () => {
    render(<InstitutionalEmail fullName="Ana Torres" />);

    expect(screen.getByText('ana.torres@especialistas.neuroalert.pe')).toBeInTheDocument();
    expect(screen.getByText('Correo institucional')).toBeInTheDocument();
  });

  it('en variante compacta muestra la etiqueta "Institucional"', () => {
    render(<InstitutionalEmail fullName="Ana Torres" compact />);

    expect(screen.getByText('Institucional')).toBeInTheDocument();
    expect(screen.getByText('ana.torres@especialistas.neuroalert.pe')).toBeInTheDocument();
  });
});
