export const DATA_NAMESPACE = 'data';

export function DATA_LIST(payload) {
  return {
    type: `${DATA_NAMESPACE}/fetchList`,
    payload,
  };
}

export function PROJECT_DATA_LIST(payload) {
  return {
    type: `${DATA_NAMESPACE}/fetchProjectDataList`,
    payload,
  };
}


export function DATA_DETAIL(id) {
  return {
    type: `${DATA_NAMESPACE}/fetchDetail`,
    payload: { id },
  };
}

export function DATA_CLEAR_DETAIL() {
  return {
    type: `${DATA_NAMESPACE}/clearDetail`,
    payload: {},
  };
}

export function DATA_SUBMIT(payload) {
  return {
    type: `${DATA_NAMESPACE}/submit`,
    payload,
  };
}

export function DATA_REMOVE(payload) {
  return {
    type: `${DATA_NAMESPACE}/remove`,
    payload,
  };
}

export function BIZ_FIELD_LIST(payload) {
  return {
    type: `${DATA_NAMESPACE}/fetchBizFieldList`,
    payload,
  };
}

export function BIZ_DATA_LIST(payload) {
  return {
    type: `${DATA_NAMESPACE}/fetchBizDataList`,
    payload,
  };
}

export function DATA_INIT(payload) {
  return {
    type: `${DATA_NAMESPACE}/fetchInit`,
    payload,
  };
}
