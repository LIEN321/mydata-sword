export const ENVVAR_NAMESPACE = 'envVar';

export function ENVVAR_LIST(payload) {
  return {
    type: `${ENVVAR_NAMESPACE}/fetchList`,
    payload,
  };
}

export function ENVVAR_DETAIL(id) {
  return {
    type: `${ENVVAR_NAMESPACE}/fetchDetail`,
    payload: { id },
  };
}

export function ENVVAR_CLEAR_DETAIL() {
  return {
    type: `${ENVVAR_NAMESPACE}/clearDetail`,
    payload: {},
  };
}

export function ENVVAR_SUBMIT(payload) {
  return {
    type: `${ENVVAR_NAMESPACE}/submit`,
    payload,
  };
}

export function ENVVAR_REMOVE(payload) {
  return {
    type: `${ENVVAR_NAMESPACE}/remove`,
    payload,
  };
}
