export const WORKPLACE_NAMESPACE = 'workplace';

export function WORKPLACE_STAT(payload) {
  return {
    type: `${WORKPLACE_NAMESPACE}/fetchStat`,
    payload,
  };
}
