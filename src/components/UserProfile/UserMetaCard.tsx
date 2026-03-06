export default function UserMetaCard({ userData }: any) {
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={
                  userData?.profile_picture?.doc_path ||
                  '/images/logo/banner.png'
                }
                onError={(e: any) => {
                  e.target.src = '/images/logo/banner.png';
                }}
                alt="user"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h3 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData?.full_name}
              </h3>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.designation?.name ?? 'Management'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.city ? userData?.city?.name : ''}
                  {', '}
                  {userData?.country ? userData?.country?.name : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
