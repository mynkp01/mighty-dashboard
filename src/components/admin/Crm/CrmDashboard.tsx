import {
  Handshake,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setUserForCrm } from '../../../redux/slices/userForCrmSlice';
import { CRM_TYPES, ROLE } from '../../../utils/Constant';
import { hexToRGBA, isEmpty, showToast } from '../../../utils/helper';
import AttachmentList from '../../common/AttachmentList';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import AnimatedCard from '../../ui/AnimatedCard';
import { TableSkeleton } from '../../ui/LoadingSkeleton';
import CrmSearchBox from './CrmSearchBox';

interface ChartsData {
  _id: string;
  total: number;
  current: number;
  percentChange: string;
  type: CRM_TYPES;
  trend: string;
  crm_sub_type?: { _id: string; name: string; totalCount: number }[];
}

interface UpcomingApproachData {
  _id: string;
  crm_id: {
    _id: string;
    company_name: string;
    clients_name: {
      name: string;
      phone_number: string;
      email: string;
      designation: string;
      linkedin: string;
      address: string;
      date_of_birth: Date;
      _id: string;
    }[];
  };
  next_approach_date: Date;
}

const CrmDashboard = () => {
  const TableCellData = [
    {
      value: 'Next Approach Date',
      sort_field: 'next_approach_date',
      isDate: true,
    },
    {
      value: 'Location',
      sort_field:
        'crm_main_id.crm_base_id.country.name,crm_main_id.crm_base_id.city.name',
    },
    { value: 'Date', sort_field: 'date', isDate: true },
    { value: 'CRM Type', sort_field: 'crm_main_id.crm_type.name' },
    { value: 'CRM Sub Type', sort_field: 'crm_main_id.crm_sub_type.name' },
    {
      value: 'Clients Name',
      sort_field: 'crm_main_id.crm_base_id.clients_name',
    },
    { value: 'Assigned To', sort_field: 'crm_main_id.users' },
    { value: 'Members', sort_field: 'members' },
    { value: 'Verticals', sort_field: 'crm_main_id.crm_base_id.vertical.name' },
    { value: 'Attachments', sort_field: 'attachment' },
    { value: 'Attachment Type', sort_field: 'attachment_type.name' },
    { value: 'Notes', sort_field: 'notes' },
    { value: 'Action' },
  ];

  const getCapitalizedLabel = (type: CRM_TYPES) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const PRIMARY_CHART_COLOR = '#014479';
  const CHART_FIELDS_DATA = [
    getCapitalizedLabel(CRM_TYPES.PROSPECT),
    getCapitalizedLabel(CRM_TYPES.LEAD),
    getCapitalizedLabel(CRM_TYPES.CLOSURE),
  ];
  const CHART_FIELDS_COLORS = [
    PRIMARY_CHART_COLOR,
    hexToRGBA(PRIMARY_CHART_COLOR, 0.8),
    hexToRGBA(PRIMARY_CHART_COLOR, 0.6),
    hexToRGBA(PRIMARY_CHART_COLOR, 0.4),
  ];

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const crmUserData: any = useAppSelector(
    (state) => state.userForCrm?.userForCrm,
  );
  const userData: any = useAppSelector((state) => state.user);

  const [crmData, setCrmData] = useState<ChartsData[]>([]);
  const [upcomingApproachDate, setUpcomingApproachDate] = useState<
    UpcomingApproachData[]
  >([]);
  const [animatedCounts, setAnimatedCounts] = useState<ChartsData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [payload, setPayload] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: 'desc',
    sort_field: 'updatedAt',
    country: [],
    city: [],
    crm_type: [],
    crm_sub_type: [],
    vertical: [],
    type: 'monthly',
    startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  });

  const getDataByType = (type: CRM_TYPES) => {
    return crmData.find((item) => item.type === type)?.current || 0;
  };

  const getAnimatedDataByType = (type: CRM_TYPES) => {
    return animatedCounts.find((item) => item.type === type)?.current || 0;
  };

  const getPercentChangeByType = (type: CRM_TYPES) => {
    return crmData.find((item) => item.type === type)?.percentChange || '0%';
  };

  const getCrmSubTypes = (type: CRM_TYPES) => {
    return crmData.find((item) => item.type === type)?.crm_sub_type || [];
  };

  const fetchDashboardData = async () => {
    const animateNumbers = (data: ChartsData[]) => {
      setIsAnimating(true);

      setAnimatedCounts(data.map((item) => ({ ...item, current: 0 })));

      const duration = 500;
      const fps = 60;
      const frames = duration / (1000 / fps);
      let frame = 0;

      const easeOutQuad = (t: number) => t * (2 - t);

      const animate = () => {
        frame++;
        const progress = easeOutQuad(frame / frames);

        setAnimatedCounts(
          data.map((item) => ({
            ...item,
            current: Math.round(item.current * progress),
          })),
        );

        if (frame < frames) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedCounts(data);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    };

    try {
      const { data } = await apiHandler.crmHandler.dashboard({
        ...payload,
        user_id: crmUserData,
      });
      const finalData: ChartsData[] = data?.data?.summary || [];
      const upcomingApproachData: UpcomingApproachData[] =
        data?.data?.next_approach_date || [];

      setCrmData([]);
      setUpcomingApproachDate(upcomingApproachData);
      setTimeout(() => {
        setCrmData(finalData);
      }, 100);

      animateNumbers(finalData);
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  useEffect(() => {
    if (!isEmpty(payload?.search)) {
      const debounceTimer = setTimeout(() => {
        fetchDashboardData();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else if (
      payload.type === 'custom' &&
      isEmpty(payload.startDate) &&
      isEmpty(payload.endDate)
    ) {
      return;
    } else {
      fetchDashboardData();
    }
  }, [
    payload?.search,
    payload?.page,
    payload?.limit,
    payload?.sort,
    payload?.sort_field,
    payload?.country,
    payload?.city,
    payload?.crm_type,
    payload?.crm_sub_type,
    payload?.vertical,
    payload?.type,
    payload?.startDate,
    payload?.endDate,
    crmUserData,
  ]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    if (!isEmpty(params)) {
      const newPayload: any = { ...payload };
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'user_id') {
          dispatch(setUserForCrm(value.split(',')));
        } else if (
          ['country', 'city', 'crm_type', 'crm_sub_type', 'vertical'].includes(
            key,
          )
        ) {
          newPayload[key] = value.split(',');
        } else if (['page', 'limit'].includes(key)) {
          newPayload[key] = Number(value);
        } else {
          newPayload[key] = value;
        }
      });
      setPayload(newPayload);
    } else {
      // If no URL params, update URL with current payload to preserve filters
      const newParams = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (
          value !== '' &&
          value !== null &&
          value !== undefined &&
          !isEmpty(value)
        ) {
          newParams.set(key, value.toString());
        }
      });
      if (!isEmpty(crmUserData)) {
        newParams.set('user_id', crmUserData.toString());
      }
      if (newParams.toString()) {
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const newParams = new URLSearchParams();

    Object.entries(payload).forEach(([key, value]) => {
      if (
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !isEmpty(value)
      ) {
        newParams.set(key, value.toString());
      }
    });

    if (!isEmpty(crmUserData)) {
      newParams.set('user_id', crmUserData.toString());
    }

    setSearchParams(newParams, { replace: true });
  }, [payload, crmUserData]);

  const onClickToNavigate = (type: CRM_TYPES, crm_sub_type: string = '') => {
    const newParams = searchParams;
    const crmTypeId = crmData?.find(
      (i) => i.type?.toLowerCase() === type?.toLowerCase(),
    );
    newParams.set('crm_type', crmTypeId?._id || '');

    if (!isEmpty(crm_sub_type)) {
      const crmSubTypeId =
        crmTypeId?.crm_sub_type?.find(
          (i: any) => i.name?.toLowerCase() === crm_sub_type?.toLowerCase(),
        )?._id || '';

      newParams.set('crm_sub_type', crmSubTypeId);
    }

    navigate(`/crm/pipeline?${newParams.toString()}`);
  };

  const commonChartOptions: ApexCharts.ApexOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.1,
      },
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const selectedLabel = config.w.globals.labels[config.dataPointIndex];
          if (selectedLabel) {
            onClickToNavigate(selectedLabel);
          }
        },
      },
    },
    colors: CHART_FIELDS_COLORS,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
      dropShadow: {
        enabled: false,
      },
    },
    xaxis: {
      categories: CHART_FIELDS_DATA,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#374151'],
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: ['#6B7280'],
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.globals.labels[dataPointIndex || seriesIndex];
        const value = !isEmpty(dataPointIndex)
          ? series[seriesIndex][dataPointIndex]
          : series[seriesIndex];

        return `<div style="padding: 12px 16px; background: #1f2937; color: white; border-radius: 8px; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <strong>${getCapitalizedLabel(label)}</strong><br/>
          <span style="color: #9ca3af;">Count:</span> ${value} items
        </div>`;
      },
    },
  };

  const chartOptions: ApexCharts.ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'donut' as const,
    },
    labels: CHART_FIELDS_DATA,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              formatter: (val: string) => val,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total CRM',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6B7280',
              formatter: () =>
                `${crmData.reduce((sum, item) => sum + item.current, 0)}`,
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom' as const,
      fontSize: '14px',
      fontWeight: 500,
      itemMargin: { horizontal: 8 },
      markers: { size: 6.5 },
      show: true,
    },
  };

  const barChartOptions: ApexCharts.ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar' as const,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 12,
        distributed: true,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    grid: {
      show: true,
      borderColor: '#F3F4F6',
      strokeDashArray: 3,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const funnelChartOptions: ApexCharts.ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar' as const,
      width: '100%',
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const selectedLabel: any = CHART_FIELDS_DATA[config.dataPointIndex];

          if (selectedLabel) {
            onClickToNavigate(selectedLabel);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '60%',
        borderRadius: 0,
        isFunnel: true,
      },
    },
    yaxis: {
      ...commonChartOptions.yaxis,
      labels: {
        ...(!Array.isArray(commonChartOptions.yaxis)
          ? commonChartOptions.yaxis?.labels
          : {}),
        formatter: function (value) {
          return value.toString();
        },
      },
    },
  };

  const chartData = [
    getDataByType(CRM_TYPES.LEAD),
    getDataByType(CRM_TYPES.PROSPECT),
    getDataByType(CRM_TYPES.CLOSURE),
  ];

  // const isEmptyData = true;
  const isEmptyData = chartData.every((i) => i === 0);

  const barData = [
    {
      name: 'Count',
      data: chartData,
    },
  ];

  const funnelData = [
    {
      name: 'Count',
      data: [
        // Prospects
        getDataByType(CRM_TYPES.PROSPECT) +
          getDataByType(CRM_TYPES.LEAD) +
          getDataByType(CRM_TYPES.CLOSURE),
        // Leads
        getDataByType(CRM_TYPES.LEAD) + getDataByType(CRM_TYPES.CLOSURE),
        // Closures
        getDataByType(CRM_TYPES.CLOSURE),
      ],
    },
  ];

  const getTrendText = () => {
    return payload.type === 'yearly' ? 'from past year' : 'from past month';
  };

  const getTrendInfo = (type: CRM_TYPES) => {
    const percentChange = getPercentChangeByType(type);
    const isNegative = percentChange.includes('-');
    return {
      color: isNegative ? 'text-red-600' : 'text-green-600',
      icon: isNegative ? TrendingDown : TrendingUp,
    };
  };

  return (
    <div className="space-y-6">
      {/* Bread Crumb */}
      <PageBreadcrumb pageTitle="CRM Dashboard" />

      {/* Filters */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <CrmSearchBox
          payload={payload}
          setPayload={setPayload}
          onClick={() => navigate('/crm/clients/create')}
          currentRole={userData?.user_type}
          isLoading={isAnimating}
          permission={[ROLE.ADMIN, ROLE.BDE]}
          showActionButtons={false}
          handleResetFilters={() => {
            const initialPayload: Record<string, any> = {};

            Object.keys(payload)
              .filter(
                (key) =>
                  ![
                    'startDate',
                    'endDate',
                    'sort',
                    'type',
                    'sort_field',
                    'page',
                    'limit',
                  ].includes(key),
              )
              .forEach((key) => {
                initialPayload[key] = Array.isArray((payload as any)[key])
                  ? []
                  : '';
              });
            setPayload((prev) => ({ ...prev, ...initialPayload }));
            dispatch(setUserForCrm([]));
          }}
          showResetFilterButton={
            Object.entries(payload)
              .filter(
                ([key]) =>
                  ![
                    'startDate',
                    'endDate',
                    'sort',
                    'type',
                    'sort_field',
                    'page',
                    'limit',
                  ].includes(key),
              )
              .some(([, value]) =>
                Array.isArray(value) ? value.length > 0 : value !== '',
              ) || !isEmpty(crmUserData)
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="grid h-fit grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Prospect */}
        <AnimatedCard delay={200} hover className="group select-none">
          <div
            className="flex items-center justify-between"
            onClick={() => onClickToNavigate(CRM_TYPES.PROSPECT)}
          >
            <div>
              <p className="text-3xl font-bold text-black transition-all duration-300 group-hover:scale-110">
                {getAnimatedDataByType(CRM_TYPES.PROSPECT)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Prospects</p>
              {payload.type !== 'custom' &&
                (() => {
                  const trendInfo = getTrendInfo(CRM_TYPES.PROSPECT);
                  const TrendIcon = trendInfo.icon;
                  return (
                    <div
                      className={`flex items-center mt-2 text-xs ${trendInfo.color}`}
                    >
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {getPercentChangeByType(CRM_TYPES.PROSPECT)}{' '}
                      {getTrendText()}
                    </div>
                  );
                })()}
            </div>
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
              <Handshake className="w-6 h-6 text-black" />
            </div>
          </div>
        </AnimatedCard>

        {/* Lead */}
        <AnimatedCard
          delay={100}
          hover
          className="group h-fit space-y-4 select-none"
        >
          <div
            className="flex items-center justify-between"
            onClick={() => onClickToNavigate(CRM_TYPES.LEAD)}
          >
            <div>
              <p className="text-3xl font-bold text-black transition-all duration-300 group-hover:scale-110">
                {getAnimatedDataByType(CRM_TYPES.LEAD)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Leads</p>
              {payload.type !== 'custom' &&
                (() => {
                  const trendInfo = getTrendInfo(CRM_TYPES.LEAD);
                  const TrendIcon = trendInfo.icon;
                  return (
                    <div
                      className={`flex items-center mt-2 text-xs ${trendInfo.color}`}
                    >
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {getPercentChangeByType(CRM_TYPES.LEAD)} {getTrendText()}
                    </div>
                  );
                })()}
            </div>
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>
          {!isEmpty(getCrmSubTypes(CRM_TYPES.LEAD)) && (
            <div className="space-y-1">
              {getCrmSubTypes(CRM_TYPES.LEAD).map((subType) => (
                <div
                  key={subType.name}
                  className="flex justify-between text-xs text-gray-500"
                  onClick={() =>
                    onClickToNavigate(CRM_TYPES.LEAD, subType.name)
                  }
                >
                  <span className="truncate cursor-pointer relative hover:text-primary-600 transition-all duration-200 flex items-center gap-1 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[1px] before:bg-primary-600 before:transition-all before:duration-300 hover:before:w-full">
                    {subType.name}{' '}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                    >
                      <path
                        fill="currentColor"
                        d="M6 1h5v5L8.86 3.85 4.7 8 4 7.3l4.15-4.16zM2 3h2v1H2v6h6V8h1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">
                    {getCrmSubTypes(CRM_TYPES.LEAD).find(
                      (item) => item.name === subType.name,
                    )?.totalCount || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>

        {/* Closure */}
        <AnimatedCard delay={300} hover className="group select-none">
          <div
            className="flex items-center justify-between"
            onClick={() => onClickToNavigate(CRM_TYPES.CLOSURE)}
          >
            <div>
              <p className="text-3xl font-bold text-black transition-all duration-300 group-hover:scale-110">
                {getAnimatedDataByType(CRM_TYPES.CLOSURE)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Closures</p>
              {payload.type !== 'custom' &&
                (() => {
                  const trendInfo = getTrendInfo(CRM_TYPES.CLOSURE);
                  const TrendIcon = trendInfo.icon;
                  return (
                    <div
                      className={`flex items-center mt-2 text-xs ${trendInfo.color}`}
                    >
                      <TrendIcon className="w-3 h-3 mr-1" />
                      {getPercentChangeByType(CRM_TYPES.CLOSURE)}{' '}
                      {getTrendText()}
                    </div>
                  );
                })()}
            </div>
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
              <Target className="w-6 h-6 text-black" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Charts */}
      {!isEmptyData ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Funnel Chart */}
          <AnimatedCard delay={500} hover className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Sales Pipeline Funnel
            </h3>
            <div className="h-80 transform transition-all duration-500 hover:scale-[1.03]">
              <Chart
                options={funnelChartOptions}
                series={funnelData}
                type="bar"
                height="100%"
                width="100%"
              />
            </div>
          </AnimatedCard>

          {/* Pie Chart */}
          <AnimatedCard delay={600} hover className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              CRM Overview
            </h3>
            <div className="h-80 transform transition-all duration-500 hover:scale-[1.03] justify-center">
              <Chart
                options={chartOptions}
                series={chartData}
                type="donut"
                height="100%"
              />
            </div>
          </AnimatedCard>

          {/* Bar Chart */}
          <AnimatedCard delay={700} hover className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Performance Metrics
            </h3>
            <div className="h-80 transform transition-all duration-500 hover:scale-[1.03] justify-center">
              <Chart
                options={barChartOptions}
                series={barData}
                type="bar"
                height="100%"
                width="100%"
              />
            </div>
          </AnimatedCard>
        </div>
      ) : null}

      {/* Upcoming Approaches Table */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Upcoming Approaches
      </h2>

      {/* AttachmentList */}
      {isAnimating ? (
        <TableSkeleton rows={10} columns={9} />
      ) : (
        <AttachmentList
          tableCellData={TableCellData}
          listData={upcomingApproachDate}
          handleFetchData={fetchDashboardData}
          handleAttachment={(item: any) =>
            navigate(`/crm/pipeline/attachment?id=${item?.crm_main_id?._id}`)
          }
        />
      )}
    </div>
  );
};

export default CrmDashboard;
