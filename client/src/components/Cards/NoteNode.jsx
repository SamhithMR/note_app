import NoteCard from "../Cards/NoteCard";

const NoteNode = ({ data }) => {
  return (
    <div className="w-[250px]">
      <NoteCard
        title={data.title}
        date={data.createdOn}
        content={data.content}
        onEdit={data.onEdit}
        onView={data.onView}
        onDelete={data.onDelete}
      />
      
    </div>
  );
};

export default NoteNode;
