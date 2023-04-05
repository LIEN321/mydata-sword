export const API_NAMESPACE = 'api';

export function API_LIST(payload) {
  return {
    type: `${API_NAMESPACE}/fetchList`,
    payload,
  };
}

export function API_DETAIL(id) {
  return {
    type: `${API_NAMESPACE}/fetchDetail`,
    payload: { id },
  };
}

export function API_CLEAR_DETAIL() {
  return {
    type: `${API_NAMESPACE}/clearDetail`,
    payload: {},
  };
}

export function API_SUBMIT(payload) {
  return {
    type: `${API_NAMESPACE}/submit`,
    payload,
  };
}

export function API_REMOVE(payload) {
  return {
    type: `${API_NAMESPACE}/remove`,
    payload,
  };
}

export function API_INIT() {
  return {
    type: `${API_NAMESPACE}/fetchInit`,
    payload: {},
  };
}

export function API_DEBUG(payload) {
  return {
    type: `${API_NAMESPACE}/fetchDebug`,
    payload,
  };
}