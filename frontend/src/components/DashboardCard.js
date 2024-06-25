const DashboardCard = ({ resource }) => {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-md p-4">
        <h2 className="text-xl font-bold mb-2">{resource.name}</h2>
        <p className="text-gray-600 mb-2">{resource.description}</p>
        <p className="text-sm text-gray-500">Visibility: {resource.visibility}</p>
      </div>
    );
  };
  
  export default DashboardCard;