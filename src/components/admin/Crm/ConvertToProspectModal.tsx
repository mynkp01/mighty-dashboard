import { useEffect, useState } from 'react';
import { apiHandler } from '../../../api/apiHandler';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/loadingSlice';
import { CRM_TYPES, ROLE } from '../../../utils/Constant';
import { isEmpty, showToast } from '../../../utils/helper';
import Label from '../../form/Label';
import Select from '../../form/Select';
import AnimatedButton from '../../ui/AnimatedButton';
import Button from '../../ui/button/Button';
import { Modal } from '../../ui/modal';

const ConvertToProspectModal = ({
  isOpen,
  closeModal,
  crmItem,
  handleFetchData,
}: any) => {
  const dispatch = useAppDispatch();

  const [crmTypes, setCrmTypes] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]);
  const [error, setErrors] = useState('');

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

  useEffect(() => {
    fetchCrmTypes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (isEmpty(assignedTo)) {
      setErrors('Please select at least one user to assign');
    } else {
      try {
        dispatch(setIsLoading(true));
        const { data } = await apiHandler.crmHandler.convertTo({
          crm_base_id: crmItem?._id,
          users: assignedTo,
          crm_type: (
            crmTypes?.find(
              (i: any) => i?.value_code === CRM_TYPES.PROSPECT,
            ) as any
          )?._id,
        });
        showToast('success', data?.message);
        closeModal();
        handleFetchData();
      } catch (error: any) {
        showToast('error', error?.message);
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  useEffect(() => {
    setAssignedTo(crmItem?.assigned_to?.map((i: any) => i?._id) || []);
  }, [crmItem]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[700px] m-4 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Convert To Prospect
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Full Name */}
        <div>
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Assigned To
          </Label>
          <Select
            endPoints={apiHandler.userHandler.lookup}
            filterStr={`user_type=${ROLE.ADMIN},${ROLE.BDE}`}
            placeholder="Select who you want to assign"
            value={assignedTo || []}
            display="full_name"
            func={(_, value) => setAssignedTo(value?.map((i: any) => i?._id))}
            multiple
          />
          {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
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
            Convert
          </AnimatedButton>
        </div>
      </form>
    </Modal>
  );
};

export default ConvertToProspectModal;
