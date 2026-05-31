 
const STATES = {
  NOVO: 'Novo',
  EM_ANALISE: 'Em Análise',
  EM_ANDAMENTO: 'Em Andamento',
  RESOLVIDO: 'Resolvido',
  ARQUIVADO: 'Arquivado',
};

const TRANSITIONS = {
  [STATES.NOVO]: [STATES.EM_ANALISE, STATES.ARQUIVADO],
  [STATES.EM_ANALISE]: [STATES.EM_ANDAMENTO, STATES.ARQUIVADO],
  [STATES.EM_ANDAMENTO]: [STATES.RESOLVIDO, STATES.ARQUIVADO],
  [STATES.RESOLVIDO]: [STATES.ARQUIVADO],
  [STATES.ARQUIVADO]: [],
};

export function canTransition(currentState, nextState) {
  const allowed = TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

export function getNextStates(currentState) {
  return TRANSITIONS[currentState] || [];
}

export { STATES };
