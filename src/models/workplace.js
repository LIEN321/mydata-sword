import { message } from 'antd';
import router from 'umi/router';
import { WORKPLACE_NAMESPACE } from '../actions/workplace';
import { queryStat } from '../services/workplace';

export default {
  namespace: WORKPLACE_NAMESPACE,
  state: {
    stat: {},
  },
  effects: {
    *fetchStat({ payload }, { call, put }) {
      const response = yield call(queryStat, payload);
      if (response.success) {
        yield put({
          type: 'saveStat',
          payload: {
            stat: response.data,
          },
        });
      }
    },
  },
  reducers: {
    saveStat(state, action) {
      return {
        ...state,
        stat: action.payload.stat,
      };
    },
  },
};
