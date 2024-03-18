import { stringify } from 'qs';
import func from '../utils/Func';
import request from '../utils/request';

export async function list(params) {
  return request(`/api/mydata-manage/env_var/list?${stringify(params)}`);
}

export async function submit(params) {
  return request('/api/mydata-manage/env_var/submit', {
    method: 'POST',
    body: params,
  });
}

export async function detail(params) {
  return request(`/api/mydata-manage/env_var/detail?${stringify(params)}`);
}

export async function remove(params) {
  return request('/api/mydata-manage/env_var/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

export async function hide(params) {
  return request('/api/mydata-manage/env_var/hide', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

export async function show(params) {
  return request('/api/mydata-manage/env_var/show', {
    method: 'POST',
    body: func.toFormData(params),
  });
}