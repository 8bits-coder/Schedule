import { GetAllItems } from "@/actions/itemActions";

const ShowAllItems = async () => {
  const items = await GetAllItems();
  if (!items) {
    return <div>No items found.</div>;
  }

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="mb-2 text-black">
            <strong>{item.name}</strong>: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowAllItems;
