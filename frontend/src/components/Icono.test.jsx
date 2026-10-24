import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Icono, { NOMBRES_ICONO } from './Icono';

describe('Icono', () => {
  it('expone el trazado cambiarCamara', () => {
    const html = renderToStaticMarkup(<Icono nombre="cambiarCamara" tamano={16} />);
    expect(html).toContain('M4 4v5h.582');
    expect(NOMBRES_ICONO).toContain('cambiarCamara');
  });

  it('renderiza el svg sin trazos si el icono no existe', () => {
    const html = renderToStaticMarkup(<Icono nombre="inexistente" />);
    expect(html).toContain('<svg');
    expect(html.match(/<path/g) || []).toHaveLength(0);
  });
});
