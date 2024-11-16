const NotificationCard = () => {
  return (
    <div className="space-y-1">
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <p className="text-sm">From</p>
        <p className="text-xs text-gray-700 dark:text-indigo-200">Date</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, neque!
      </p>
    </div>
  );
};

export default NotificationCard;
