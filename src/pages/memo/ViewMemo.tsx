import BackButton from "@/components/kit/BackButton";
import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateMemo from "@/pages/memo/CreateMemo";

function ViewMemo() {
  return (
    <>
      <div className="container mx-auto">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-36 top-12">
            <BackButton />
          </div>
          <div className="absolute right-36 top-12">
            <CreateMemo />
          </div>
          <h1 className="text-5xl font-bold text-center py-7">Memo List</h1>
        </div>
        <Table>
          <TableHeader className="bg-slate-200 ">
            <TableRow>
              <TableHead className="text-center font-bold text-black w-48">
                Date
              </TableHead>
              <TableHead className="text-center font-bold text-black w-60">
                Subject
              </TableHead>
              <TableHead className="font-bold text-black text-center w-80">
                Description
              </TableHead>
              <TableHead className="text-center font-bold text-black w-24">
                Acknowledge
              </TableHead>
              <TableHead className="text-center font-bold text-black w-36">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody></TableBody>
          <TableFooter>
            <TableRow>{/* Additional footer content can go here */}</TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}

export default ViewMemo;
