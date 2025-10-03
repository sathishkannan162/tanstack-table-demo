import { Table } from "../../components/Table";
import { generateDummyData } from "../../lib/dummyData";

export default async function TablePage() {
  const data = generateDummyData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Employee Directory</h1>
      <Table data={data} />
    </div>
  );
}
