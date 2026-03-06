import { useEffect, useState } from 'react';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { isEmpty, showToast } from '../../../utils/helper';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';
import Button from '../../ui/button/Button';
import { Modal } from '../../ui/modal';

const ChangeCRMStatusModal = ({
  isOpen,
  closeModal,
  item,
  handleFetchData,
}: any) => {
  const dispatch = useAppDispatch();

  const [crmTypes, setCrmTypes] = useState([]);
  const [crmSubTypes, setCrmSubTypes] = useState([]);
  const [payload, setPayload] = useState({ crm_type: '', crm_sub_type: '' });
  const [errors, setErrors] = useState<typeof payload>();

  useEffect(() => {
    setPayload({
      crm_type: item?.crm_type?._id || '',
      crm_sub_type: item?.crm_sub_type?._id || '',
    });
  }, [item?.crm_type?._id, item?.crm_sub_type?._id]);

  useEffect(() => {
    fetchCrmTypes();
  }, []);

  useEffect(() => {
    if (!isEmpty(payload.crm_type)) {
      fetchCrmSubTypes();
    } else {
      setCrmSubTypes([]);
    }
  }, [payload.crm_type]);

  const fetchCrmTypes = async () => {
    try {
      const { data } = await apiHandler.lookupValueHandler.lookupValue(
        'value_code=CRM_TYPE',
      );
      setCrmTypes(data?.data || []);
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  const fetchCrmSubTypes = async () => {
    try {
      const { data } = await apiHandler.lookupValueHandler.lookupValue(
        `parent_category_id=${payload?.crm_type || ''}`,
      );
      setCrmSubTypes(data?.data || []);
    } catch (error: any) {
      showToast('error', error?.message);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: Record<string, string> = {
      crm_type: 'CRM Type is required',
      crm_sub_type: 'CRM Sub Type is required',
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      const value = (payload as any)[field];
      if (field === 'crm_type' && isEmpty(value)) {
        newErrors[field] = message;
      }
      if (field === 'crm_sub_type' && !isEmpty(crmSubTypes) && isEmpty(value)) {
        newErrors[field] = message;
      }
    });

    setErrors(newErrors as typeof errors);
    return isEmpty(newErrors);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        dispatch(setIsLoading(true));
        const { data, status } = await apiHandler.crmHandler.updateStatus(
          item?._id,
          {
            crm_type: payload.crm_type,
            crm_sub_type: !isEmpty(payload.crm_sub_type)
              ? payload.crm_sub_type
              : null,
          },
        );
        if ([200, 201].includes(status)) {
          showToast('success', data?.message);
        } else {
          showToast('error', data?.message);
        }
        closeModal();
        handleFetchData();
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const updateFormData = (field: string, value: any) => {
    setPayload((prev) => ({ ...prev, [field]: value?._id }));

    if (field === 'crm_type') {
      setPayload((prev) => ({ ...prev, crm_sub_type: '' }));
    }

    if (errors?.[field as keyof typeof payload]) {
      setErrors((prevErrors: any) => ({ ...prevErrors, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] m-4 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Change CRM Status
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* CRM Type */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            CRM Type
          </Label>
          <Select
            data={crmTypes}
            placeholder="Select CRM Type"
            value={payload?.crm_type}
            objKey="crm_type"
            display="name"
            func={updateFormData}
          />
          {errors?.crm_type && (
            <p className="mt-1 text-sm text-error-500">{errors?.crm_type}</p>
          )}
        </div>

        {/* CRM Sub Type */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            CRM Sub Type
          </Label>
          <Select
            data={crmSubTypes}
            placeholder="Select CRM Sub Type"
            value={payload?.crm_sub_type}
            objKey="crm_sub_type"
            isDisabled={isEmpty(payload?.crm_type)}
            display="name"
            func={updateFormData}
          />
          {errors?.crm_sub_type && (
            <p className="mt-1 text-sm text-error-500">
              {errors?.crm_sub_type}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            name="Cancel"
            size="xs"
            onClick={closeModal}
            variant="outline"
          />
          <AnimatedButton type="submit" variant="primary" size="md">
            Change
          </AnimatedButton>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeCRMStatusModal;
