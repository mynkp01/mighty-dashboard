import { ArrowLeft, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useNavigate, useSearchParams } from 'react-router';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { ROLE } from '../../../utils/Constant';
import { showToast } from '../../../utils/helper';
import PageBreadcrumb from '../../common/PageBreadCrumb';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';
import Button from '../../ui/button/Button';

const CostEstimationCreate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  const action = searchParams.get('action');
  const id: any = searchParams.get('id');

  const [errors, setErrors] = useState<any>({});
  const [currencyRates, setCurrencyRates] = useState<any>(null);
  const [viewData, setViewData] = useState<any>([]);
  const [tableData, setTableData] = useState<any>(null);
  const [totalEmp, setTotalEmp] = useState<any[]>([]);
  const [totalSalary, setTotalSalary] = useState<number>(0);
  const [formData, setFormData] = useState({
    tl: '',
    client: '',
    by_ref: '',
    cost_of_resource: [
      {
        emp_category: '',
        emp_id: '',
        hours: '',
        cost: '',
        salary: '',
      },
    ],
    cost_of_qc: {
      emp_category: '',
      emp_id: '',
      hours: '',
      cost: '',
      salary: '',
    },
    cost_of_delivery: 0,
    cost_to_company: 0,
    seat_cost: { key: '', value: '' },
    cost_of_tpi: [{ key: '', value: '' }],
    management_cost: '',
    resources_estimation: {
      total_cost_estimation: { inr: 0, usd: 0, aud: 0 },
      total_hours: 0,
      ph: { inr: 0, usd: 0, aud: 0 },
      pd: { inr: 0, usd: 0, aud: 0 },
      pw: { inr: 0, usd: 0, aud: 0 },
    },
    company_estimation: {
      total_cost_estimation: { inr: 0, usd: 0, aud: 0 },
      total_hours: 0,
      ph: { inr: 0, usd: 0, aud: 0 },
      pd: { inr: 0, usd: 0, aud: 0 },
      pw: { inr: 0, usd: 0, aud: 0 },
    },
    rates: {
      INRUSD: '',
      INRAUD: '',
      date: '',
    },
    final_date: '',
    final_amount: 0,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedFormData = (
    field: string,
    index: number,
    key: string,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateQCData = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      cost_of_qc: {
        ...prev.cost_of_qc,
        [key]: value,
      },
    }));
  };

  const updateSeatCost = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      seat_cost: {
        ...prev.seat_cost,
        [key]: value,
      },
    }));
  };

  const updateTotalResourceCost = (key: string, value: any) => {
    setFormData((prev) => {
      const updatedResources: any = { ...prev.resources_estimation };
      const keys = key.split('.');

      if (keys.length === 1) {
        updatedResources[keys[0]] = value;
      } else if (keys.length === 2) {
        const [parentKey, childKey] = keys;
        updatedResources[parentKey] = {
          ...updatedResources[parentKey],
          [childKey]: value,
        };
      }

      return {
        ...prev,
        resources_estimation: updatedResources,
      };
    });
  };

  const updateTotalCompanyCost = (key: string, value: any) => {
    setFormData((prev) => {
      const updatedCompany: any = { ...prev.company_estimation };
      const keys = key.split('.');

      if (keys.length === 1) {
        updatedCompany[keys[0]] = value;
      } else if (keys.length === 2) {
        const [parentKey, childKey] = keys;
        updatedCompany[parentKey] = {
          ...updatedCompany[parentKey],
          [childKey]: value,
        };
      }

      return {
        ...prev,
        company_estimation: updatedCompany,
      };
    });
  };

  useEffect(() => {
    let totalCost = 0;
    let totalHours = 0;

    formData.cost_of_resource.forEach((resource) => {
      totalCost += parseFloat(resource.cost) || 0;
      totalHours += parseFloat(resource.hours) || 0;
    });

    totalCost += parseFloat(formData.cost_of_qc.cost) || 0;
    totalHours += parseFloat(formData.cost_of_qc.hours) || 0;

    const deliveryCost = (((totalCost || 0) * 40) / (totalHours || 1)).toFixed(
      2,
    );

    updateFormData('cost_of_delivery', deliveryCost);

    totalHours += 40;

    if (formData?.seat_cost) {
      updateSeatCost(
        'value',
        Number(formData.seat_cost.key) * (totalHours || 0),
      );
    }

    updateFormData('cost_to_company', (totalSalary / 160) * totalHours);
  }, [
    formData.cost_of_resource,
    formData.cost_of_qc,
    formData.seat_cost.key,
    formData.cost_to_company,
    totalSalary,
  ]);

  useEffect(() => {
    if (!totalEmp?.length) return;
    const salarySum = totalEmp.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    setTotalSalary(salarySum);
  }, [totalEmp]);

  const validateForm = () => {
    const newErrors: any = {};

    // Basic field validations
    if (!formData.tl.trim()) newErrors.tl = 'TL Name is required';
    if (!formData.client.trim()) newErrors.client = 'Client Name is required';
    if (!formData.by_ref.trim()) newErrors.by_ref = 'Ref Name is required';
    if (!formData.cost_of_delivery)
      newErrors.cost_of_delivery = 'Cost of Delivery is required';
    if (!formData.cost_to_company)
      newErrors.cost_to_company = 'Cost of Company is required';
    if (!formData.seat_cost?.key) newErrors.seat_cost = 'Seat Cost is required';
    if (!formData.management_cost)
      newErrors.management_cost = 'Management Cost is required';

    // Cost of resource validation
    if (formData.cost_of_resource.length === 0) {
      newErrors.cost_of_resource = 'Cost of Resource is required';
    } else {
      formData.cost_of_resource.forEach((resource, index) => {
        if (!resource.emp_category)
          newErrors[`cost_of_resource_${index}_emp_category`] =
            'Employee category is required';
        if (!resource.emp_id)
          newErrors[`cost_of_resource_${index}_emp_id`] =
            'Employee is required';
        if (!resource.hours)
          newErrors[`cost_of_resource_${index}_hours`] = 'Hours are required';
        if (!resource.cost)
          newErrors[`cost_of_resource_${index}_cost`] = 'Cost is required';
      });
    }

    // // Cost of QC validation
    // if (!formData.cost_of_qc.emp_category)
    //   newErrors.cost_of_qc_emp_category = 'QC Employee category is required';
    // if (!formData.cost_of_qc.emp_id)
    //   newErrors.cost_of_qc_emp_id = 'QC Employee is required';
    // if (!formData.cost_of_qc.hours)
    //   newErrors.cost_of_qc_hours = 'QC Hours are required';
    // if (!formData.cost_of_qc.cost)
    //   newErrors.cost_of_qc_cost = 'QC cost is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addResource = () => {
    setFormData((prev) => ({
      ...prev,
      cost_of_resource: [
        ...prev.cost_of_resource,
        {
          emp_category: '',
          emp_id: '',
          hours: '',
          cost: '',
          salary: '',
        },
      ],
    }));
  };

  // Remove resource
  const removeResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cost_of_resource: prev.cost_of_resource.filter((_, i) => i !== index),
    }));
  };

  // Add new TPI
  const addTPI = () => {
    setFormData((prev) => ({
      ...prev,
      cost_of_tpi: [...prev.cost_of_tpi, { key: '', value: '' }],
    }));
  };

  // Remove TPI
  const removeTPI = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cost_of_tpi: prev.cost_of_tpi.filter((_, i) => i !== index),
    }));
  };

  // Handle resource hours change
  const handleResourceHoursChange = (index: number, hours: number) => {
    updateNestedFormData('cost_of_resource', index, 'hours', hours);
    const calculatedCost =
      (Number(formData.cost_of_resource[index]?.salary || 0) / 160) *
      Number(hours || 0);

    updateNestedFormData('cost_of_resource', index, 'cost', calculatedCost);
  };

  // Handle QC hours change
  const handleQCHoursChange = (hours: number) => {
    updateQCData('hours', hours);

    const calculatedCost =
      (Number(formData.cost_of_qc.salary || 0) / 160) * Number(hours || 0);
    updateQCData('cost', calculatedCost);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        dispatch(setIsLoading(true));
        const { data } =
          action === 'edit'
            ? await apiHandler.costEstimationHandler.update(id, formData)
            : await apiHandler.costEstimationHandler.create(formData);

        showToast('success', data?.message);
        navigate(-1);
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleNestedFetchDropdownChange = useCallback(
    (name: string, value: any, i: number) => {
      updateNestedFormData('cost_of_resource', i, name, value?._id);

      if (name === 'emp_id') {
        updateNestedFormData('cost_of_resource', i, 'salary', value?.salary);
      }

      if (name === 'emp_category') {
        updateNestedFormData('cost_of_resource', i, 'emp_id', '');
      }
    },
    [],
  );

  const handleQCChange = useCallback((name: string, value: any) => {
    updateQCData(name, value._id);
    if (name === 'emp_id') {
      updateQCData('salary', value.salary);
    }
  }, []);

  useEffect(() => {
    const toNumber = (val: any) => parseFloat(val || 0);

    const commonHours = 40 + toNumber(formData.cost_of_qc?.hours);
    let commonCost =
      toNumber(formData.cost_of_qc?.cost) +
      toNumber(formData.cost_of_delivery) +
      toNumber(formData.seat_cost?.value) +
      toNumber(formData.management_cost);

    if (Array.isArray(formData.cost_of_tpi)) {
      commonCost += formData.cost_of_tpi.reduce(
        (sum, resource) => sum + toNumber(resource?.value),
        0,
      );
    }

    let resourceCost = 0,
      resourceHours = 0;
    if (Array.isArray(formData.cost_of_resource)) {
      resourceCost += formData.cost_of_resource.reduce(
        (sum, resource) => sum + toNumber(resource?.cost),
        0,
      );
      resourceHours += formData.cost_of_resource.reduce(
        (sum, resource) => sum + toNumber(resource?.hours),
        0,
      );
    }

    const totalHours = commonHours + resourceHours;
    const totalResourceCost = commonCost + resourceCost;
    updateTotalResourceCost('total_cost_estimation.inr', totalResourceCost);
    updateTotalResourceCost('total_hours', totalHours);
    updateTotalResourceCost('ph.inr', totalResourceCost / 160);
    updateTotalResourceCost('pw.inr', totalResourceCost / 40);
    updateTotalResourceCost('pd.inr', totalResourceCost / 8);

    const totalComponyCost = commonCost + toNumber(formData.cost_to_company);
    updateTotalCompanyCost('total_cost_estimation.inr', totalComponyCost);
    updateTotalCompanyCost('total_hours', totalHours);
    updateTotalCompanyCost('ph.inr', totalComponyCost / 160);
    updateTotalCompanyCost('pw.inr', totalComponyCost / 40);
    updateTotalCompanyCost('pd.inr', totalComponyCost / 8);
  }, [
    formData.cost_of_qc?.cost,
    formData.cost_of_delivery,
    formData.seat_cost,
    formData.management_cost,
    formData.cost_of_tpi,
    formData.cost_of_resource,
    formData.cost_to_company,
  ]);

  const handleViewData = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.costEstimationHandler.get(id);
      setViewData(data?.data?.data);
      setTableData(data?.data?.timeEstimation);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    handleFetchEmployee();
    if (id) {
      handleViewData();
    }
  }, [id]);

  useEffect(() => {
    if (id && viewData) {
      setFormData((prev) => ({
        ...prev,
        ...viewData,
        cost_of_tpi:
          viewData.cost_of_tpi?.length > 0
            ? viewData.cost_of_tpi
            : [{ key: '', value: '' }],
      }));
    }
  }, [id, viewData]);

  const handleFetchEmployee = async () => {
    try {
      dispatch(setIsLoading(true));
      const { data } = await apiHandler.userHandler.lookup(
        `user_type=${ROLE.EMPLOYEE}`,
      );
      setTotalEmp(data?.data);
    } catch (error: any) {
      showToast('error', error?.message);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const fetchRates = async () => {
    try {
      const response = await fetch(
        'https://apilayer.net/api/live?access_key=88eb19cf9952168e582799f8d3ad90a7&currencies=USD,AUD&source=INR&format=1',
      );
      const data = await response.json();

      if (data.success !== false) {
        const INRUSD = data.quotes['INRUSD'];
        const INRAUD = data.quotes['INRAUD'];

        setCurrencyRates({ INRUSD, INRAUD });

        setFormData((prev: any) => ({
          ...prev,
          rates: {
            ...prev.rates,
            INRUSD: INRUSD ? (1 / INRUSD).toFixed(2) : prev.rates.INRUSD,
            INRAUD: INRAUD ? (1 / INRAUD).toFixed(2) : prev.rates.INRAUD,
            date: moment().format('DD-MM-YYYY'),
          },
        }));

        setFormData((prev) => {
          const convertSection = (section: any) => {
            const updated = { ...section };

            const keysToConvert = ['total_cost_estimation', 'ph', 'pd', 'pw'];

            keysToConvert.forEach((key) => {
              const inrValue = section[key]?.inr ?? 0;

              updated[key] = {
                inr: inrValue,
                usd: parseFloat((inrValue * INRUSD).toFixed(2)),
                aud: parseFloat((inrValue * INRAUD).toFixed(2)),
              };
            });

            return updated;
          };

          return {
            ...prev,
            resources_estimation: convertSection(prev.resources_estimation),
            company_estimation: convertSection(prev.company_estimation),
          };
        });
      } else {
        console.log('Exchange rate API error:', data.error);
      }
    } catch (error) {
      console.log('Fetch failed:', error);
    }
  };

  const costRows = [
    ['Total Cost Estimation', 'total_cost_estimation'],
    ['Total Hours', 'total_hours'],
    ['Per Hour', 'ph'],
    ['Per Day', 'pd'],
    ['Per Week', 'pw'],
  ];

  const renderFormattedValue = (value: any, currency = 'INR') => {
    if (value === null || value === undefined || isNaN(value)) return '-';

    return parseFloat(value).toLocaleString('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Generate Cost Estimation" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ">
        <div className="px-6 py-3 flex justify-end">
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </AnimatedButton>
        </div>
        {/* FORM  */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Top 3 Text Box  */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md">
              {/* Client Name  */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="client"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Client Name
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Client Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    value={formData.client}
                    onChange={(e) => updateFormData('client', e.target.value)}
                  />
                </div>
                {errors.client && (
                  <p className="mt-1 text-sm text-error-500">{errors.client}</p>
                )}
              </div>
              {/* REf Name */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="by_ref"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  By Reference
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Reference Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    value={formData?.by_ref}
                    onChange={(e) => updateFormData('by_ref', e.target.value)}
                  />
                </div>
                {errors.by_ref && (
                  <p className="mt-1 text-sm text-error-500">{errors.by_ref}</p>
                )}
              </div>
              {/* TL Name  */}
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="tl"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  TL Name
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter TL Name"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                    type="text"
                    value={formData.tl}
                    onChange={(e) => updateFormData('tl', e.target.value)}
                  />
                </div>
                {errors.tl && (
                  <p className="mt-1 text-sm text-error-500">{errors.tl}</p>
                )}
              </div>
            </div>
            {/* Cost Of Resource */}
            <div className="space-y-5">
              {formData.cost_of_resource?.map((item, index) => (
                <div
                  key={index}
                  className="shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md space-y-4"
                >
                  {index === 0 && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 pb-4">
                      <h2 className="text-base font-semibold">
                        Cost of Resource
                      </h2>
                      {action !== 'view' && (
                        <Button
                          type="button"
                          name="Add Resource"
                          size="xs"
                          onClick={addResource}
                        />
                      )}
                    </div>
                  )}

                  {index > 0 && action !== 'view' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeResource(index)}
                        className="text-red-500 cursor-pointerr"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Employee Category
                      </Label>
                      <div className="relative">
                        <Select
                          isDisabled={action === 'view'}
                          index={index}
                          endPoints={apiHandler.lookupValueHandler.lookupValue}
                          filterStr={`value_code=DEPARTMENT`}
                          value={item?.emp_category}
                          display="name"
                          objKey="emp_category"
                          placeholder="Select Employee Category"
                          func={handleNestedFetchDropdownChange}
                        />
                      </div>
                      {errors[`cost_of_resource_${index}_emp_category`] && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors[`cost_of_resource_${index}_emp_category`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="designation"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Employee
                      </Label>
                      <div className="relative">
                        <Select
                          isDisabled={action === 'view' || !item.emp_category}
                          isComponentDisabled={!item?.emp_category}
                          index={index}
                          endPoints={apiHandler.userHandler.lookup}
                          filterStr={`department=${item?.emp_category}&user_type=${ROLE.EMPLOYEE}`}
                          display="full_name"
                          objKey="emp_id"
                          placeholder="Select Employee"
                          value={item.emp_id}
                          func={handleNestedFetchDropdownChange}
                        />
                      </div>
                      {errors[`cost_of_resource_${index}_emp_id`] && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors[`cost_of_resource_${index}_emp_id`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="designation"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Hours
                      </Label>
                      <div className="relative">
                        <Input
                          readOnly={action === 'view'}
                          disabled={!item.emp_id}
                          min="0"
                          placeholder="Enter Hours"
                          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          value={item.hours}
                          onChange={(e: any) =>
                            handleResourceHoursChange(index, e.target.value)
                          }
                          onInput={(e: any) => {
                            const input = e.target;
                            if (input.value.length > 4) {
                              input.value = input.value.slice(0, 4);
                            }
                          }}
                        />
                      </div>
                      {errors[`cost_of_resource_${index}_hours`] && (
                        <p className="mt-1 text-sm text-error-500">
                          {errors[`cost_of_resource_${index}_hours`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="designation"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Cost
                      </Label>
                      <div className="relative">
                        <Input
                          value={item?.cost || 0}
                          readOnly
                          placeholder="Cost"
                          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                          type="number"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Cost Of QC */}
            <div className="shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md space-y-4">
              <div className="sm:flex grid justify-between gap-4 border-b border-gray-200 pb-4">
                <h2 className="text-base font-semibold">Cost of QC</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-2">
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Employee Category
                  </Label>
                  <div className="relative">
                    <Select
                      isDisabled={action === 'view'}
                      endPoints={apiHandler.lookupValueHandler.lookupValue}
                      filterStr={`value_code=DEPARTMENT&value=QC`}
                      value={formData.cost_of_qc.emp_category}
                      display="name"
                      objKey="emp_category"
                      placeholder="Select Employee Category"
                      func={handleQCChange}
                    />
                  </div>
                  {errors.cost_of_qc_emp_category && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.cost_of_qc_emp_category}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Employee
                  </Label>
                  <div className="relative">
                    <Select
                      isDisabled={action === 'view'}
                      isComponentDisabled={!formData.cost_of_qc.emp_category}
                      endPoints={apiHandler.userHandler.lookup}
                      filterStr={`department=${formData?.cost_of_qc?.emp_category}&user_type=${ROLE.EMPLOYEE}`}
                      value={formData?.cost_of_qc?.emp_id}
                      display="full_name"
                      objKey="emp_id"
                      placeholder="Select Employee"
                      func={handleQCChange}
                    />
                  </div>
                  {errors.cost_of_qc_emp_id && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.cost_of_qc_emp_id}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Hours
                  </Label>
                  <div className="relative">
                    <Input
                      readOnly={action === 'view'}
                      disabled={!formData.cost_of_qc.emp_id}
                      placeholder="Enter Hours"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      min="0"
                      value={formData.cost_of_qc.hours}
                      onChange={(e: any) => handleQCHoursChange(e.target.value)}
                      onInput={(e: any) => {
                        const input = e.target;
                        if (input.value.length > 4) {
                          input.value = input.value.slice(0, 4);
                        }
                      }}
                    />

                    {/* <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                      <Clock3 className="size-5" />
                    </span> */}
                  </div>
                  {errors.cost_of_qc_hours && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.cost_of_qc_hours}
                    </p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label
                    htmlFor="designation"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    Cost
                  </Label>
                  <div className="relative">
                    <Input
                      value={formData.cost_of_qc.cost || 0}
                      readOnly
                      placeholder="Cost"
                      className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                      type="number"
                      inputMode="numeric"
                    />
                    {/* <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                      <CircleDollarSign className="size-5" />
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
            {/* Cost of Delivery && Cost To Company */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md">
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Cost of Delivery{' '}
                  <span className="text-[12px] text-gray-400">
                    {'(per week)'}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    value={formData.cost_of_delivery}
                    readOnly
                    placeholder="Cost of Delivery"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                  />
                  {/* <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                    <CircleDollarSign className="size-5" />
                  </span> */}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Cost To Company
                </Label>
                <div className="relative">
                  <Input
                    readOnly
                    placeholder="Enter Cost To Company"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    inputMode="numeric"
                    value={formData?.cost_to_company}
                    onChange={(e) =>
                      updateFormData('cost_to_company', e.target.value)
                    }
                  />
                </div>
                {errors.cost_to_company && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.cost_to_company}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md">
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Seat Cost / Admin Cost{' '}
                  <span className="text-[12px] text-gray-400">
                    {'(per hour/per person)'}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Enter Seat Cost / Admin Cost"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    min="0"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = e.target;
                      if (input.value.length > 6) {
                        input.value = input.value.slice(0, 6);
                      }
                    }}
                    value={formData?.seat_cost.key}
                    onChange={(e) => updateSeatCost('key', e.target.value)}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400 flex justify-end">
                    {formData.seat_cost.value || 0}
                  </span>
                </div>
                {errors.seat_cost && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.seat_cost}
                  </p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="designation"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Management + TL Cost{' '}
                  <span className="text-[12px] text-gray-400">{'(Total)'}</span>
                </Label>
                <div className="relative">
                  <Input
                    readOnly={action === 'view'}
                    placeholder="Management + TL Cost"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    min="0"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const input = e.target;
                      if (input.value.length > 10) {
                        input.value = input.value.slice(0, 10);
                      }
                    }}
                    value={formData?.management_cost}
                    onChange={(e) =>
                      updateFormData('management_cost', e.target.value)
                    }
                  />
                </div>
                {errors.management_cost && (
                  <p className="mt-1 text-sm text-error-500">
                    {errors.management_cost}
                  </p>
                )}
              </div>
            </div>
            {/* Cost Of Third Party Intigration */}
            <div className="space-y-5">
              {formData?.cost_of_tpi.map((item: any, index: number) => (
                <div
                  key={index}
                  className="shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md space-y-4"
                >
                  {index === 0 && (
                    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 pb-4">
                      <h2 className="text-base font-semibold">
                        Cost of Third Party Intigration
                      </h2>
                      {action !== 'view' && (
                        <Button
                          type="button"
                          name={'Add'}
                          size="xs"
                          onClick={addTPI}
                        />
                      )}
                    </div>
                  )}
                  {index > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeTPI(index)}
                        className="text-red-500 cursor-pointerr"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="tl"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Key
                      </Label>
                      <div className="relative">
                        <Input
                          readOnly={action === 'view'}
                          placeholder="Enter Key"
                          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                          type="text"
                          value={item.key}
                          onChange={(e) => {
                            updateNestedFormData(
                              'cost_of_tpi',
                              index,
                              'key',
                              e.target.value,
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="tl"
                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        Value
                      </Label>
                      <div className="relative">
                        <Input
                          readOnly={action === 'view'}
                          placeholder="Enter Value"
                          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          min="0"
                          onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const input = e.target;
                            if (input.value.length > 4) {
                              input.value = input.value.slice(0, 4);
                            }
                          }}
                          value={item.value}
                          onChange={(e) => {
                            updateNestedFormData(
                              'cost_of_tpi',
                              index,
                              'value',
                              e.target.value,
                            );
                          }}
                        />
                        {/* <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-3 top-1/2 dark:text-gray-400">
                          <User className="size-5" />
                        </span> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Total Cost Of Project  */}
            <div className="shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md space-y-4 overflow-hidden">
              <div className="border-b border-gray-200 pb-4 justify-between flex items-center">
                <h2 className="text-base font-semibold ">
                  Total Cost of Project
                </h2>
                {action !== 'view' && (
                  <Button
                    disabled={currencyRates}
                    name="Currency Convert"
                    size="sm"
                    className="bg-green-500 hover:bg-green-400"
                    onClick={() => fetchRates()}
                    type="button"
                  />
                )}
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="text-left table-auto border-collapse border border-gray-200 w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th rowSpan={2} className="p-4 border align-middle">
                        <div className="flex flex-col justify-between h-full min-h-[100px]">
                          {/* Top Right Rates */}
                          <div className="flex justify-between items-start">
                            <div></div> {/* Empty space for left */}
                            <div className="text-start text-xs font-semibold space-y-1">
                              <div>USD: {formData.rates?.INRUSD}</div>
                              <div>AUD: {formData.rates?.INRAUD}</div>
                              <div>Date: {formData.rates.date || ''}</div>
                            </div>
                          </div>
                          {/* Bottom Left Label */}
                          <div className="font-bold text-base">Label</div>
                        </div>
                      </th>
                      <th
                        colSpan={3}
                        className="p-2 border border-gray-200 text-center bg-blue-50"
                      >
                        Resource Wise
                      </th>
                      <th
                        colSpan={3}
                        className="p-2 border border-gray-200 text-center bg-green-50"
                      >
                        Company Wise
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="p-2 border border-gray-200">INR</th>
                      <th className="p-2 border border-gray-200">USD</th>
                      <th className="p-2 border border-gray-200">AUD</th>
                      <th className="p-2 border border-gray-200">INR</th>
                      <th className="p-2 border border-gray-200">USD</th>
                      <th className="p-2 border border-gray-200">AUD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costRows.map(([label, key], i) => {
                      const resourceData = (
                        formData.resources_estimation as any
                      )[key];
                      const companyData = (formData.company_estimation as any)[
                        key
                      ];

                      const isWorkingHours = key === 'total_hours';

                      const resourceINR = isWorkingHours
                        ? resourceData
                        : (resourceData?.inr ?? 0);
                      const resourceUSD = isWorkingHours
                        ? 0
                        : (resourceData?.usd ?? 0);
                      const resourceAUD = isWorkingHours
                        ? 0
                        : (resourceData?.aud ?? 0);

                      const companyINR = isWorkingHours
                        ? companyData
                        : (companyData?.inr ?? 0);
                      const companyUSD = isWorkingHours
                        ? 0
                        : (companyData?.usd ?? 0);
                      const companyAUD = isWorkingHours
                        ? 0
                        : (companyData?.aud ?? 0);

                      return (
                        <tr key={i} className="border border-gray-200">
                          <td className="p-2 border border-gray-200 font-medium bg-white">
                            {label}
                          </td>

                          {/* Resource Wise */}
                          <td className="p-2 border border-gray-200 text-gray-600 bg-blue-25">
                            {label !== 'Total Hours'
                              ? renderFormattedValue(resourceINR, 'INR')
                              : resourceINR + 'hr'}
                          </td>

                          {isWorkingHours ? (
                            <td
                              className="p-2 border border-gray-200 text-center bg-blue-25 text-gray-400"
                              colSpan={2}
                            >
                              Not Applicable
                            </td>
                          ) : (
                            <>
                              <td className="p-2 border border-gray-200 text-gray-600 bg-blue-25">
                                {renderFormattedValue(resourceUSD, 'USD')}
                              </td>
                              <td className="p-2 border text-gray-600 bg-blue-25 border-r-4 border-blue-100">
                                {renderFormattedValue(resourceAUD, 'AUD')}
                              </td>
                            </>
                          )}

                          {/* Company Wise */}
                          <td className="p-2 border border-gray-200 text-gray-600 bg-green-25">
                            {label !== 'Total Hours'
                              ? renderFormattedValue(companyINR, 'INR')
                              : companyINR + 'hr'}
                          </td>

                          {isWorkingHours ? (
                            <td
                              className="p-2 border border-gray-200 text-center bg-green-25 text-gray-400"
                              colSpan={2}
                            >
                              Not Applicable
                            </td>
                          ) : (
                            <>
                              <td className="p-2 border border-gray-200 text-gray-600 bg-green-25">
                                {renderFormattedValue(companyUSD)}
                              </td>
                              <td className="p-2 border border-gray-200 text-gray-600 bg-green-25">
                                {renderFormattedValue(companyAUD)}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Time Estimation  */}
            {tableData && action === 'view' && (
              <div className="shadow-[0_2px_5px_rgba(1,1,1,0.1)] p-5 rounded-md space-y-4">
                <h2 className="text-base font-semibold">Time Estimation</h2>
                <table className="w-full text-left table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border border-gray-200">Label</th>
                      <th className="p-2 border border-gray-200 bg-blue-50 text-center">
                        Hours
                      </th>
                      <th className="p-2 border border-gray-200 bg-green-50 text-center">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((item: any, i: number) => (
                      <tr key={i} className="border border-gray-200">
                        <td className="p-2 border border-gray-200 font-medium bg-white">
                          {item?.label}
                        </td>
                        <td className="p-2 border border-gray-200 text-gray-600 bg-blue-25 text-center">
                          {item?.hours ?? 0}
                        </td>
                        <td className="p-2 border border-gray-200 text-gray-600 bg-green-25 text-center">
                          {item?.cost?.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 2,
                          }) ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid gap-2 grid-cols-2 w-1/2">
              {/* Final Delivery Amount */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Final Delivery Amount
                </Label>
                <Input
                  readOnly={action === 'view'}
                  placeholder="Enter Final Delivery Amount"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance]:textfield"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  min="0"
                  onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const input = e.target;
                    if (input.value.length > 9) {
                      input.value = input.value.slice(0, 9);
                    }
                  }}
                  value={formData?.final_amount}
                  onChange={(e) =>
                    updateFormData('final_amount', e.target.value)
                  }
                />
              </div>

              {/* Final Delivery Date */}
              <div className="col-span-2 sm:col-span-1">
                <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Final Delivery Date
                </Label>
                <Flatpickr
                  disabled={action === 'view'}
                  placeholder="Select Final Delivery Date"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:!text-gray-400 focus:outline-hidden focus:ring-0 bg-transparent text-gray-800 border-gray-300 focus:border-primary-300"
                  options={{ dateFormat: 'd-m-Y' }}
                  value={
                    formData.final_date ? new Date(formData.final_date) : ''
                  }
                  onChange={([date]) => {
                    const formattedDate = moment(date).format('YYYY-MM-DD');
                    updateFormData('final_date', formattedDate);
                  }}
                />
              </div>
            </div>

            {action !== 'view' && (
              <div className="flex justify-end">
                <AnimatedButton type="submit" variant="primary" size="md">
                  {action === 'edit'
                    ? 'Update Cost Estimation'
                    : 'Create Cost Estimation'}
                </AnimatedButton>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationCreate;
