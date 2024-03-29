import { stringify } from 'qs';
import func from '../utils/Func';
import request from '../utils/request';

export async function list(params) {
  return request(`/api/mydata-manage/env/list?${stringify(params)}`);
}

export async function submit(params) {
  return request('/api/mydata-manage/env/submit', {
    method: 'POST',
    body: params,
  });
}

export async function detail(params) {
  return request(`/api/mydata-manage/env/detail?${stringify(params)}`);
}

export async function remove(params) {
  return request('/api/mydata-manage/env/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

export async function select(params) {
  return request(`/api/mydata-manage/env/select?${stringify(params)}`);
}

export async function projectEnv(params) {
  return request(`/api/mydata-manage/env/project_env?${stringify(params)}`);
}

export async function syncTask(params) {
  return request(`/api/mydata-manage/env/syncTask?${stringify(params)}`, {
    method: 'PUT'
  });
}
