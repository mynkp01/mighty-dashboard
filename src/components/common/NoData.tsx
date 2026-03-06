import { NoDataFound } from '../../icons';

const NoData = ({ text = 'No Data Found' }: any) => {
  return (
    <div className="py-10 w-full grid items-center justify-center text-gray-300">
      <NoDataFound className="w-full h-full" />
      <span>{text}</span>
    </div>
  );
};

export default NoData;
