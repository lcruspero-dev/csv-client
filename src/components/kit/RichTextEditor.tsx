import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  handleDescriptionChange: (content: string) => void;
  description: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ handleDescriptionChange, description }) => {
  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div  >
      <ReactQuill className='h-36' value={description} onChange={handleDescriptionChange} modules={modules}/>
    </div>
  );
};

export default RichTextEditor;