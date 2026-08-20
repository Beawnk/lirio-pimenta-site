/* Dados oficiais da loja. Toda a interface lê daqui — número de WhatsApp,
   endereço ou horário nunca são escritos direto num componente. */

export const WHATSAPP = '5551998073190'
export const PHONE = '+555130463033'
export const PHONE_LABEL = '(51) 3046-3033'
export const WHATSAPP_LABEL = '(51) 99807-3190'

export const INSTAGRAM = 'https://www.instagram.com/lojaliriopimenta/'
export const INSTAGRAM_HANDLE = '@lojaliriopimenta'

/* URL oficial ainda não confirmada com o Lírio — enquanto vazia, o link fica inativo. */
export const FACEBOOK_URL = ''

export const ADDRESS = {
  street: 'Rua Ramiro Barcelos, 84',
  district: 'Centro',
  city: 'Viamão',
  state: 'RS',
  full: 'Rua Ramiro Barcelos, 84 — Centro, Viamão/RS',
}

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rua+Ramiro+Barcelos%2C+84%2C+Centro%2C+Viam%C3%A3o%2C+RS'

/* Índice = getDay() do JavaScript: 0 é domingo. open/close em HH:MM, null = fechado. */
export const HOURS = [
  { day: 'Domingo', open: null, close: null },
  { day: 'Segunda', open: '09:00', close: '18:30' },
  { day: 'Terça', open: '09:00', close: '18:30' },
  { day: 'Quarta', open: '09:00', close: '18:30' },
  { day: 'Quinta', open: '08:30', close: '18:30' },
  { day: 'Sexta', open: '08:30', close: '18:30' },
  { day: 'Sábado', open: '08:30', close: '18:30' },
]
