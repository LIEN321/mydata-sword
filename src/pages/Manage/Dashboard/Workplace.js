import React, { PureComponent } from 'react';
import { Card, Col, Collapse, Row, Divider, Tag, Statistic } from 'antd';
import styles from '../../../layouts/Sword.less';

import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import ThirdRegister from '../../../components/ThirdRegister';
import { Link } from 'umi';
import { connect } from 'dva';
import { WORKPLACE_STAT } from '@/actions/workplace';

const { Panel } = Collapse;

@connect(({ workplace }) => ({
  workplace,
}))

class Workplace extends PureComponent {
  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(WORKPLACE_STAT());
  }

  render() {
    const {
      workplace : { stat },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className={styles.card} bordered={false}>
          <Row gutter={24}>
            <Col span={24}>
              <ThirdRegister />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={6}>

              <Card title="数据" bordered={false} extra={<Link to={'/manage/data'}>更多</Link>}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Statistic title="数据项" value={stat.dataCount}></Statistic>
                  </Col>
                  <Col span={12}>
                    <Statistic title="业务数据" value={stat.bizDataCount}></Statistic>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={4}>
              <Card title="应用" bordered={false} extra={<Link to={'/manage/app'}>更多</Link>}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Statistic title="应用" value={stat.appCount}></Statistic>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card title="API" bordered={false} extra={<Link to={'/manage/api'}>更多</Link>}>
                <Row gutter={24}>
                  <Col span={6}>
                    <Statistic title="API" value={stat.apiCount}></Statistic>
                  </Col>
                  <Col span={9}>
                    <Statistic title="提供数据" value={stat.producerCount}></Statistic>
                  </Col>
                  <Col span={9}>
                    <Statistic title="消费数据" value={stat.consumerCount}></Statistic>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="任务" bordered={false} extra={<Link to={'/manage/task'}>更多</Link>}>
                <Col span={6}>
                  <Statistic title="任务" value={stat.taskCount}></Statistic>
                </Col>
                <Col span={6}>
                  <Statistic title="运行" value={stat.runningCount}></Statistic>
                </Col>
                <Col span={6}>
                  <Statistic title="异常" value={stat.failedCount}></Statistic>
                </Col>
                <Col span={6}>
                  <Statistic title="停止" value={stat.stoppedCount}></Statistic>
                </Col>
              </Card>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Workplace;
