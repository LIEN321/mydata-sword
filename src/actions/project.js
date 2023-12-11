export const PROJECT_NAMESPACE = 'project';

export function PROJECT_LIST(payload) {
  return {
    type: `${PROJECT_NAMESPACE}/fetchList`,
    payload,
  };
}

export function PROJECT_DETAIL(id) {
  return {
    type: `${PROJECT_NAMESPACE}/fetchDetail`,
    payload: { id },
  };
}

export function PROJECT_CLEAR_DETAIL() {
  return {
    type: `${PROJECT_NAMESPACE}/clearDetail`,
    payload: {},
  };
}

export function PROJECT_SUBMIT(payload) {
  return {
    type: `${PROJECT_NAMESPACE}/submit`,
    payload,
  };
}

export function PROJECT_REMOVE(payload) {
  return {
    type: `${PROJECT_NAMESPACE}/remove`,
    payload,
  };
}
