import { stringify } from 'qs';
import func from '../utils/Func';
import request from '../utils/request';

export async function list(params) {
  return request(`/api/mydata-manage/task/list?${stringify(params)}`);
}

export async function dataTasks(params) {
  return request(`/api/mydata-manage/task/data_tasks?${stringify(params)}`);
}

export async function submit(params) {
  return request('/api/mydata-manage/task/submit', {
    method: 'POST',
    body: params,
  });
}

export async function detail(params) {
  return request(`/api/mydata-manage/task/detail?${stringify(params)}`);
}

export async function remove(params) {
  return request('/api/mydata-manage/task/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

export async function startTask(taskId) {
  return request(`/api/mydata-manage/task/start/${taskId}`, {
    method: 'POST',
  });
}

export async function stopTask(taskId) {
  return request(`/api/mydata-manage/task/stop/${taskId}`, {
    method: 'POST',
  });
}

export async function executeTask(taskId) {
  return request(`/api/mydata-manage/task/execute/${taskId}`, {
    method: 'POST',
  });
}

export async function taskLogList(params) {
  return request(`/api/mydata-manage/task/logs?${stringify(params)}`);
}