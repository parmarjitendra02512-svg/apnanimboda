import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Users } from "lucide-react";
import { adminApiCall } from "@/lib/api";

interface BulkUploaderProps {
  onSuccess: () => void;
}

export default function BulkUploader({ onSuccess }: BulkUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (!selected.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.");
      return;
    }
    
    setFile(selected);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selected);
  };

  const parseCSV = (text: string) => {
    try {
      // Basic CSV parsing splitting by newlines and commas
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        throw new Error("CSV file must have a header row and at least one data row.");
      }

      // We expect: Name, Mobile, Profession, Location, Panchayat, Pincode, Age, Gender
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const expectedHeaders = ["name", "mobile", "profession", "location", "panchayat", "pincode", "age", "gender"];
      const missingHeaders = expectedHeaders.filter(eh => !headers.some(h => h.includes(eh)));
      
      // If we are strictly matching, we could enforce headers, but we'll map by index for simplicity if exact match fails
      // Assuming user uses the provided template
      
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple split by comma (doesn't handle commas inside quotes properly without complex regex, assuming simple data)
        const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ''));
        if (row.length < 2) continue; // Skip empty rows
        
        const mobile = row[1] || "";
        if (!mobile || mobile.length < 10) continue; // Skip if mobile is invalid

        const id = "u_" + mobile; // Unique ID based on mobile

        records.push({
          id,
          name: row[0] || "Unknown",
          mobile,
          profession: row[2] || "",
          location: row[3] || "",
          gram_panchayat: row[4] || "",
          pincode: row[5] || "",
          age: row[6] || "",
          gender: row[7] || "",
          isPremium: false,
          isVerified: true, // Auto verified since uploaded by admin
        });
      }
      
      setParsedData(records);
    } catch (err: any) {
      setError("Failed to parse CSV: " + err.message);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await adminApiCall("batch_upload_users", { users: parsedData });
      setSuccess(true);
      setParsedData([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = "Name,Mobile,Profession,Location,Panchayat,Pincode,Age,Gender\nRajesh Kumar,9876543210,Farmer,Ward 5,Nimboda,341508,45,Male\nAnita Devi,9876543211,Teacher,Main Market,Nimboda,341508,35,Female";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "nimboda_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteBulkUsers = async () => {
    if (!confirm("Are you sure you want to delete ALL bulk-uploaded (fake) users? This cannot be undone.")) return;
    setDeletingBulk(true);
    setError(null);
    try {
      await adminApiCall("delete_bulk_users");
      alert("All bulk-uploaded users have been successfully deleted!");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Deletion failed");
    } finally {
      setDeletingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Upload Box */}
        <div className="flex-1 glass-card p-6 border-blue-500/30 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Upload CSV File</h3>
              <p className="text-sm text-slate-400">Add multiple users at once</p>
            </div>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-white/5"
          >
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-300 font-medium">
              {file ? file.name : "Click to select .csv file"}
            </p>
            {!file && <p className="text-xs text-slate-500 mt-1">Excel (Save as CSV) format only</p>}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button 
              onClick={downloadTemplate}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Download Sample Template
            </button>
            <button 
              onClick={() => { setFile(null); setParsedData([]); if(fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Status Box */}
        <div className="flex-1 glass-card p-6 border-emerald-500/30 rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Upload Status</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {error && (
              <div className="bg-red-500/20 text-red-300 p-4 rounded-xl flex items-start gap-3 border border-red-500/30 mb-4">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/20 text-emerald-300 p-4 rounded-xl flex items-start gap-3 border border-emerald-500/30 mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">Successfully uploaded all users to the directory!</p>
              </div>
            )}

            {!error && !success && parsedData.length > 0 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-2xl font-bold text-white">{parsedData.length}</h4>
                <p className="text-slate-400 mb-6">Valid users found in CSV</p>
                
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {loading ? "Uploading..." : "Upload to Database"}
                </button>
              </div>
            )}

            {!error && !success && parsedData.length === 0 && (
              <div className="text-center text-slate-500">
                <p>Upload a CSV file to see a preview of records.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden border-white/10">
          <div className="p-4 bg-white/5 border-b border-white/10">
            <h3 className="font-bold text-white">Data Preview (First 5 records)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Mobile</th>
                  <th className="px-4 py-3 font-semibold">Profession</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Panchayat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-400">
                {parsedData.slice(0, 5).map((u, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white">{u.name}</td>
                    <td className="px-4 py-3">{u.mobile}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">
                        {u.profession || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.location || "-"}</td>
                    <td className="px-4 py-3">{u.gram_panchayat || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 5 && (
              <div className="p-3 text-center text-xs text-slate-500 bg-white/5">
                + {parsedData.length - 5} more records
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Danger Zone: Delete Bulk Users */}
      <div className="glass-card p-6 mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-red-500 mb-1 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Delete Bulk Uploaded Users
          </h3>
          <p className="text-sm text-red-400/80">
            Click here to remove all "fake" contacts you bulk uploaded. Real registered users will not be affected.
          </p>
        </div>
        <button
          onClick={handleDeleteBulkUsers}
          disabled={deletingBulk}
          className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg ${
            deletingBulk 
              ? "bg-red-500/50 text-white/50 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"
          }`}
        >
          {deletingBulk && <Loader2 className="w-4 h-4 animate-spin" />}
          {deletingBulk ? "Deleting..." : "Delete All Fake Contacts"}
        </button>
      </div>
    </div>
  );
}
