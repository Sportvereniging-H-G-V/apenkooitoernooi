import { parse, serialize } from 'cookie';

export function pickVariant(cookieHeader?: string) {
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  let v = cookies.formVar;
  if (v !== 'A' && v !== 'B') {
    v = Math.random() < 0.5 ? 'A' : 'B';
  }
  const setCookie = serialize('formVar', v, { 
    maxAge: 60*60*24, 
    path: '/', 
    sameSite: 'Lax' 
  });
  return { v, setCookie };
}
