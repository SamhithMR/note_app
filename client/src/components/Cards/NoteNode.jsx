import { Handle } from "reactflow";
import NoteCard from "../Cards/NoteCard";

const NoteNode = ({ data }) => {
  return (
    <div className="w-[250px]">
      <NoteCard
        title={data.title}
        date={data.createdOn}
        content={data.content}
        onEdit={data.onEdit}
        onDelete={data.onDelete}
      />
      
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default NoteNode;
