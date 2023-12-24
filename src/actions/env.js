export const ENV_NAMESPACE = 'env';

export function ENV_LIST(payload) {
  return {
    type: `${ENV_NAMESPACE}/fetchList`,
    payload,
  };
}

export function ENV_DETAIL(id) {
  return {
    type: `${ENV_NAMESPACE}/fetchDetail`,
    payload: { id },
  };
}

export function ENV_CLEAR_DETAIL() {
  return {
    type: `${ENV_NAMESPACE}/clearDetail`,
    payload: {},
  };
}

export function ENV_SUBMIT(payload) {
  return {
    type: `${ENV_NAMESPACE}/submit`,
    payload,
  };
}

export function ENV_REMOVE(payload) {
  return {
    type: `${ENV_NAMESPACE}/remove`,
    payload,
  };
}

export function ENV_INIT() {
  return {
    type: `${ENV_NAMESPACE}/fetchInit`,
    payload: {},
  };
}
