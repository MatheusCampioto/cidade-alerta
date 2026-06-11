const STATES = {
  NOVO: 'Novo',
  EM_ANALISE: 'Em Análise',
  EM_ANDAMENTO: 'Em Andamento',
  RESOLVIDO: 'Resolvido',
  ARQUIVADO: 'Arquivado',
};

const TRANSITIONS = {
  [STATES.NOVO]: [
    STATES.EM_ANALISE,
    STATES.RESOLVIDO,
    STATES.ARQUIVADO,
  ],

  [STATES.EM_ANALISE]: [
    STATES.EM_ANDAMENTO,
    STATES.RESOLVIDO,
    STATES.ARQUIVADO,
  ],

  [STATES.EM_ANDAMENTO]: [
    STATES.RESOLVIDO,
    STATES.ARQUIVADO,
  ],

  [STATES.RESOLVIDO]: [
    STATES.ARQUIVADO,
  ],

  [STATES.ARQUIVADO]: [],
};

export function canTransition(currentState, nextState) {
  if (!currentState || !nextState) {
    return false;
  }

  const allowed = TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

export function getNextStates(currentState) {
  if (!currentState) {
    return [];
  }

  return TRANSITIONS[currentState] || [];
}

export function isValidState(state) {
  return Object.values(STATES).includes(state);
}

export { STATES };

