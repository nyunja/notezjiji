import { useState } from 'react';
import { itemsAPI } from '../lib/api';
import { 
  Upload, 
  FileText, 
  Tag, 
  DollarSign, 
  CheckCircle2, 
  X,
  Plus,
  Info
} from 'lucide-react';

export default function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    year: new Date().getFullYear().toString(),
    price: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('course', formData.course);
      uploadData.append('year', formData.year);
      uploadData.append('price', formData.price);
      uploadData.append('file', formData.file);
      uploadData.append('tags', JSON.stringify(tags));

      await itemsAPI.uploadItem(uploadData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">Publish Notez</h2>
          <p className="text-slate-500 dark:text-slate-400">Share your academic insights and start earning.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="premium-card p-8 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Note Details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advanced Calculus II - Complete Semester Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What makes these notes special? Mention topics covered, textbooks used, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="premium-card p-8">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-6">
              <Upload className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Document Source</h3>
            </div>

            <div className={`
              relative border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 group
              ${formData.file 
                ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-900/20'
              }
            `}>
              <input
                type="file"
                required
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center text-center">
                {formData.file ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formData.file.name}</p>
                    <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-tighter">Click to replace file</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-500">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-white" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Click or drag to upload</p>
                    <p className="text-sm text-slate-500 mt-1 uppercase font-black tracking-tighter">Support PDF, DOCX (Max 20MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="premium-card p-8 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Pricing & Course</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Price (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Course Category</label>
                <select
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none font-bold"
                >
                  <option value="">Select Course</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Academic Year</label>
                <input
                  type="text"
                  required
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="premium-card p-8 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
              <Tag className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm">Tags</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-lg"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-start space-x-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full py-4 text-lg shadow-2xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Publish Now'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
