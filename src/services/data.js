import { stringify } from 'qs';
import func from '../utils/Func';
import request from '../utils/request';

export async function list(params) {
  return request(`/api/mydata-manage/data/list?${stringify(params)}`);
}

export async function projectDataList(params) {
  return request(`/api/mydata-manage/data/projectDataList?${stringify(params)}`);
}

export async function submit(params) {
  return request('/api/mydata-manage/data/submit', {
    method: 'POST',
    body: params,
  });
}

export async function detail(params) {
  return request(`/api/mydata-manage/data/detail?${stringify(params)}`);
}

export async function remove(params) {
  return request('/api/mydata-manage/data/remove', {
    method: 'POST',
    body: func.toFormData(params),
  });
}

export async function select(params) {
  return request(`/api/mydata-manage/data/select?${stringify(params)}`);
}

export async function dataFields(params) {
  return request(`/api/mydata-manage/data/dataFields?${stringify(params)}`);
}

export async function bizFieldList(params) {
  return request(`/api/mydata-manage/biz_data/field_list?${stringify(params)}`);
}

export async function bizDataList(params) {
  return request(`/api/mydata-manage/biz_data/data_list?${stringify(params)}`);
}