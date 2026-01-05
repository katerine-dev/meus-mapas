// Modos do modal de ponto (criar/editar)
export const MODAL_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

export type ModalMode = (typeof MODAL_MODE)[keyof typeof MODAL_MODE];

// Modos do modal de confirmação de exclusão
export const CONFIRM_MODE = {
  SINGLE: 'single',
  ALL: 'all',
} as const;

export type ConfirmMode = (typeof CONFIRM_MODE)[keyof typeof CONFIRM_MODE];
