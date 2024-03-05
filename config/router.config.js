export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Login/Login' },
      { path: '/user/register', component: './Login/Register' },
      { path: '/user/register-result', component: './Login/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['administrator', 'admin', 'user', 'test', 'guest'],
    routes: [
      // dashboard
      //{ path: '/', redirect: '/dashboard/workplace' },
      { path: '/', redirect: '/manage/workplace' },
      {
        path: '/result',
        routes: [
          // result
          { path: '/result/success', component: './Result/Success' },
          { path: '/result/fail', component: './Result/Error' },
        ],
      },
      {
        path: '/exception',
        routes: [
          // exception
          { path: '/exception/403', component: './Exception/403' },
          { path: '/exception/404', component: './Exception/404' },
          { path: '/exception/500', component: './Exception/500' },
          { path: '/exception/trigger', component: './Exception/TriggerException' },
        ],
      },
      {
        path: '/account',
        routes: [
          {
            path: '/account/center',
            component: './Account/Center/Center',
            routes: [
              { path: '/account/center', redirect: '/account/center/articles' },
              { path: '/account/center/articles', component: './Account/Center/Articles' },
              { path: '/account/center/applications', component: './Account/Center/Applications' },
              { path: '/account/center/projects', component: './Account/Center/Projects' },
            ],
          },
          {
            path: '/account/settings',
            //component: './Account/Settings/Info',
            routes: [
              { path: '/account/settings', redirect: '/account/settings/base' },
              { path: '/account/settings/base', component: './Account/Settings/BaseView' },
              { path: '/account/settings/password', component: './Account/Settings/PasswordView' },
              //{ path: '/account/settings/security', component: './Account/Settings/SecurityView' },
              //{ path: '/account/settings/binding', component: './Account/Settings/BindingView' },
              {
                path: '/account/settings/notification',
                component: './Account/Settings/NotificationView',
              },
            ],
          },
        ],
      },
      {
        path: '/dashboard',
        routes: [
          { path: '/dashboard/analysis', component: './Dashboard/Analysis' },
          { path: '/dashboard/monitor', component: './Dashboard/Monitor' },
          { path: '/dashboard/workplace', component: './Dashboard/Workplace' },
        ],
      },
      {
        path: '/base',
        routes: [
          {
            path: '/base/region',
            routes: [
              { path: '/base/region', redirect: '/base/region/detail' },
              { path: '/base/region/detail', component: './Base/Region/Region' },
            ],
          },
        ],
      },
      {
        path: '/authority',
        routes: [
          {
            path: '/authority/role',
            routes: [
              { path: '/authority/role', redirect: '/authority/role/list' },
              { path: '/authority/role/list', component: './Authority/Role/Role' },
              { path: '/authority/role/add', component: './Authority/Role/RoleAdd' },
              { path: '/authority/role/add/:id', component: './Authority/Role/RoleAdd' },
              { path: '/authority/role/edit/:id', component: './Authority/Role/RoleEdit' },
              { path: '/authority/role/view/:id', component: './Authority/Role/RoleView' },
            ],
          },
          {
            path: '/authority/datascope',
            routes: [
              { path: '/authority/datascope', redirect: '/authority/datascope/list' },
              { path: '/authority/datascope/list', component: './Authority/DataScope/DataScope' },
            ],
          },
        ],
      },
      {
        path: '/system',
        routes: [
          {
            path: '/system/user',
            routes: [
              { path: '/system/user', redirect: '/system/user/list' },
              { path: '/system/user/list', component: './System/User/User' },
              { path: '/system/user/add', component: './System/User/UserAdd' },
              { path: '/system/user/edit/:id', component: './System/User/UserEdit' },
              { path: '/system/user/view/:id', component: './System/User/UserView' },
            ],
          },
          {
            path: '/system/dict',
            routes: [
              { path: '/system/dict', redirect: '/system/dict/list' },
              { path: '/system/dict/list', component: './System/Dict/Dict' },
              { path: '/system/dict/add', component: './System/Dict/DictAdd' },
              { path: '/system/dict/add/:id', component: './System/Dict/DictAdd' },
              { path: '/system/dict/edit/:id', component: './System/Dict/DictEdit' },
              { path: '/system/dict/view/:id', component: './System/Dict/DictView' },
            ],
          },
          {
            path: '/system/dept',
            routes: [
              { path: '/system/dept', redirect: '/system/dept/list' },
              { path: '/system/dept/list', component: './System/Dept/Dept' },
              { path: '/system/dept/add', component: './System/Dept/DeptAdd' },
              { path: '/system/dept/add/:id', component: './System/Dept/DeptAdd' },
              { path: '/system/dept/edit/:id', component: './System/Dept/DeptEdit' },
              { path: '/system/dept/view/:id', component: './System/Dept/DeptView' },
            ],
          },
          {
            path: '/system/post',
            routes: [
              { path: '/system/post', redirect: '/system/post/list' },
              { path: '/system/post/list', component: './System/Post/Post' },
              { path: '/system/post/add', component: './System/Post/PostAdd' },
              { path: '/system/post/add/:id', component: './System/Post/PostAdd' },
              { path: '/system/post/edit/:id', component: './System/Post/PostEdit' },
              { path: '/system/post/view/:id', component: './System/Post/PostView' },
            ],
          },
          {
            path: '/system/menu',
            routes: [
              { path: '/system/menu', redirect: '/system/menu/list' },
              { path: '/system/menu/list', component: './System/Menu/Menu' },
              { path: '/system/menu/add', component: './System/Menu/MenuAdd' },
              { path: '/system/menu/add/:id', component: './System/Menu/MenuAdd' },
              { path: '/system/menu/edit/:id', component: './System/Menu/MenuEdit' },
              { path: '/system/menu/view/:id', component: './System/Menu/MenuView' },
            ],
          },
          {
            path: '/system/param',
            routes: [
              { path: '/system/param', redirect: '/system/param/list' },
              { path: '/system/param/list', component: './System/Param/Param' },
              { path: '/system/param/add', component: './System/Param/ParamAdd' },
              { path: '/system/param/edit/:id', component: './System/Param/ParamEdit' },
              { path: '/system/param/view/:id', component: './System/Param/ParamView' },
            ],
          },
          {
            path: '/system/tenant',
            routes: [
              { path: '/system/tenant', redirect: '/system/tenant/list' },
              { path: '/system/tenant/list', component: './System/Tenant/Tenant' },
              { path: '/system/tenant/add', component: './System/Tenant/TenantAdd' },
              { path: '/system/tenant/edit/:id', component: './System/Tenant/TenantEdit' },
              { path: '/system/tenant/view/:id', component: './System/Tenant/TenantView' },
            ],
          },
          {
            path: '/system/client',
            routes: [
              { path: '/system/client', redirect: '/system/client/list' },
              { path: '/system/client/list', component: './System/Client/Client' },
              { path: '/system/client/add', component: './System/Client/ClientAdd' },
              { path: '/system/client/edit/:id', component: './System/Client/ClientEdit' },
              { path: '/system/client/view/:id', component: './System/Client/ClientView' },
            ],
          },
        ],
      },
      {
        path: '/monitor',
        routes: [
          {
            path: '/monitor/log',
            routes: [
              {
                path: '/monitor/log/usual',
                routes: [
                  { path: '/monitor/log/usual', redirect: '/monitor/log/usual/list' },
                  { path: '/monitor/log/usual/list', component: './Monitor/Log/LogUsual' },
                  { path: '/monitor/log/usual/view/:id', component: './Monitor/Log/LogUsualView' },
                ],
              },
              {
                path: '/monitor/log/api',
                routes: [
                  { path: '/monitor/log/api', redirect: '/monitor/log/api/list' },
                  { path: '/monitor/log/api/list', component: './Monitor/Log/LogApi' },
                  { path: '/monitor/log/api/view/:id', component: './Monitor/Log/LogApiView' },
                ],
              },
              {
                path: '/monitor/log/error',
                routes: [
                  { path: '/monitor/log/error', redirect: '/monitor/log/error/list' },
                  { path: '/monitor/log/error/list', component: './Monitor/Log/LogError' },
                  { path: '/monitor/log/error/view/:id', component: './Monitor/Log/LogErrorView' },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '/report',
        routes: [
          {
            path: '/report/reportlist',
            routes: [{ path: '/report/reportlist', component: './Report/Report' }],
          },
        ],
      },
      {
        path: '/tool',
        routes: [
          {
            path: '/tool/code',
            routes: [
              { path: '/tool/code', redirect: '/tool/code/list' },
              { path: '/tool/code/list', component: './System/Code/Code' },
              { path: '/tool/code/add', component: './System/Code/CodeAdd' },
              { path: '/tool/code/add/:id', component: './System/Code/CodeAdd' },
              { path: '/tool/code/edit/:id', component: './System/Code/CodeEdit' },
              { path: '/tool/code/view/:id', component: './System/Code/CodeView' },
            ],
          },
          {
            path: '/tool/datasource',
            routes: [
              { path: '/tool/datasource', redirect: '/tool/datasource/list' },
              { path: '/tool/datasource/list', component: './System/DataSource/DataSource' },
              { path: '/tool/datasource/add', component: './System/DataSource/DataSourceAdd' },
              { path: '/tool/datasource/add/:id', component: './System/DataSource/DataSourceAdd' },
              {
                path: '/tool/datasource/edit/:id',
                component: './System/DataSource/DataSourceEdit',
              },
              {
                path: '/tool/datasource/view/:id',
                component: './System/DataSource/DataSourceView',
              },
            ],
          },
        ],
      },
      // -------------------- mydata --------------------
      {
        path: '/manage',
        routes: [
          {
            path: '/manage/workplace', component: './Manage/Dashboard/Workplace'
          },
          {
            path: '/manage/project',
            routes: [
              { path: '/manage/project', redirect: '/manage/project/list' },
              { path: '/manage/project/list', component: './Manage/Project/Project' },
              { path: '/manage/project/add', component: './Manage/Project/ProjectAdd' },
              { path: '/manage/project/edit/:id', component: './Manage/Project/ProjectEdit' },
              { path: '/manage/project/view/:id', component: './Manage/Project/ProjectView' },
              { path: '/manage/project/data/:projectId', component: './Manage/Project/ProjectData/ProjectData' },
            ],
          },
          {
            path: '/manage/data',
            routes: [
              { path: '/manage/data', redirect: '/manage/data/list' },
              { path: '/manage/data/list', component: './Manage/Data/Data' },
              { path: '/manage/data/add', component: './Manage/Data/DataAdd' },
              { path: '/manage/data/edit/:id', component: './Manage/Data/DataEdit' },
              { path: '/manage/data/view/:id', component: './Manage/Data/DataView' },
            ],
          },
          {
            path: '/manage/app',
            routes: [
              { path: '/manage/app', redirect: '/manage/app/list' },
              { path: '/manage/app/list', component: './Manage/App/App' },
              { path: '/manage/app/add', component: './Manage/App/AppAdd' },
              { path: '/manage/app/edit/:id', component: './Manage/App/AppEdit' },
              { path: '/manage/app/view/:id', component: './Manage/App/AppView' },
            ],
          },
          {
            path: '/manage/api',
            routes: [
              { path: '/manage/api', redirect: '/manage/api/list' },
              { path: '/manage/api/list', component: './Manage/Api/Api' },
              { path: '/manage/api/add', component: './Manage/Api/ApiAdd' },
              { path: '/manage/api/edit/:id', component: './Manage/Api/ApiEdit' },
              { path: '/manage/api/view/:id', component: './Manage/Api/ApiView' },
            ],
          },
          {
            path: '/manage/env',
            routes: [
              { path: '/manage/env', redirect: '/manage/env/list' },
              { path: '/manage/env/list', component: './Manage/Env/Env' },
              { path: '/manage/env/add', component: './Manage/Env/EnvAdd' },
              { path: '/manage/env/edit/:id', component: './Manage/Env/EnvEdit' },
              { path: '/manage/env/view/:id', component: './Manage/Env/EnvView' },
            ],
          },
          {
            path: '/manage/task',
            routes: [
              { path: '/manage/task', redirect: '/manage/task/list' },
              { path: '/manage/task/list', component: './Manage/Task/Task' },
              { path: '/manage/task/add', component: './Manage/Task/TaskAdd' },
              { path: '/manage/task/edit/:id', component: './Manage/Task/TaskEdit' },
              { path: '/manage/task/view/:id', component: './Manage/Task/TaskView' },
            ],
          },
        ],
      },
      // ------------------------------------------------
      {
        component: '404',
      },
    ],
  },
];
