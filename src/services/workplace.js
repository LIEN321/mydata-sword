import { stringify } from 'qs';
import request from '../utils/request';
import func from '../utils/Func';

export async function queryStat() {
  return request('/api/mydata-manage/workplace/stat');
}
export async function queryTask() {
  return request('/api/mydata-manage/workplace/task');
}