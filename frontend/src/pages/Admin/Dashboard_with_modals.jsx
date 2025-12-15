import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal, FormModal, ModalSection, SuccessModal } from "@/components/ui/modal";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import { adminService, clinicService } from "@/services/api";
import { AlertCircle, CheckCircle, KeyRound, LogOut, Shield, Users } from "lucide-react";

const emptyManagerForm = {
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  confirmPassword: "",
  phone: "",
  clinic_ids: [],
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clinicManagers, setClinicManagers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
  const [addManagerModal, setAddManagerModal] = useState(false);
  const [editManagerModal, setEditManagerModal] = useState({ isOpen: false, manager: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, manager: null, password: "", confirm: "" });
  const [deleteManagerModal, setDeleteManagerModal] = useState({ isOpen: false, manager: null });
  const [managerForm, setManagerForm] = useState(emptyManagerForm);
  const [logoutModal, setLogoutModal] = useState(false);

  // If a clinic manager somehow hits this page, push them to their dashboard
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : {};
      const role = (parsed.role || "").trim().toLowerCase() === "manager"
        ? "clinic_manager"
        : (parsed.role || "").trim().toLowerCase();
      if (role === "clinic_manager") {
        navigate("/clinic-manager/dashboard", { replace: true });
      }
    } catch (e) {
      // ignore parse errors and allow admin flow
    }
  }, [navigate]);

  const coverageStats = useMemo(() => {
    const clinicSet = new Set();
    clinicManagers.forEach((manager) => {
      (manager.assigned_clinics || []).forEach((clinic) => clinicSet.add(clinic.id));
    });

    const totalClinics = clinics?.length || 0;
    const covered = clinicSet.size;

    return {
      managers: clinicManagers.length,
      coveredClinics: covered,
      unassignedClinics: Math.max(totalClinics - covered, 0),
    };
  }, [clinicManagers, clinics]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [managerData, clinicData] = await Promise.all([
          adminService.getClinicManagers(),
          clinicService.getAllClinics(),
        ]);

        setClinicManagers(managerData || []);
        setClinics(clinicData || []);
      } catch (err) {
        setError(err.message || "Unable to load clinic manager data.");
        setClinicManagers([]);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const resetManagerForm = () => setManagerForm(emptyManagerForm);

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  const getManagerName = (manager) => {
    if (manager?.name) return manager.name;
    const combined = `${manager?.first_name || ""} ${manager?.last_name || ""}`.trim();
    return combined || "Clinic Manager";
  };

  const buildManagerPayload = (form) => {
    const payload = {
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      clinic_ids: form.clinic_ids,
    };

  if (form.password?.trim()) {
    payload.password = form.password.trim();
  }

    return payload;
  };

  const validateManagerForm = (form) => {
    if (!form.email || !form.first_name || !form.last_name) {
      return "Email, first name, and last name are required.";
    }

    if (!form.clinic_ids.length) {
      return "Assign the manager to at least one clinic.";
    }

    return "";
  };

  const openCreateModal = () => {
    resetManagerForm();
    setError("");
    setAddManagerModal(true);
  };

  const openEditModal = (manager) => {
    setManagerForm({
      email: manager.email || "",
      first_name: manager.first_name || "",
      last_name: manager.last_name || "",
      clinic_ids: manager.assigned_clinics?.map((clinic) => clinic.id) || [],
    });
    setError("");
    setEditManagerModal({ isOpen: true, manager });
  };

  const openPasswordModal = (manager) => {
    setPasswordModal({ isOpen: true, manager, password: "", confirm: "" });
    setError("");
  };

  const refreshManagers = async () => {
    const managerData = await adminService.getClinicManagers();
    setClinicManagers(managerData || []);
  };

  const handleCreateManager = async (event) => {
    event.preventDefault();
    const validationError = validateManagerForm(managerForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await adminService.createClinicManager(buildManagerPayload(managerForm));
      setAddManagerModal(false);
      setSuccessModal({
        isOpen: true,
        title: "Clinic Manager Created",
        message: `${managerForm.first_name} ${managerForm.last_name} now has clinic manager access.${
          managerForm.password ? "" : " Default password: password123."
        }`,
      });
      resetManagerForm();
      await refreshManagers();
    } catch (err) {
      setError(err.message || "Unable to create clinic manager.");
    }
  };

  const handleUpdateManager = async (event) => {
    event.preventDefault();
    const validationError = validateManagerForm(managerForm);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await adminService.updateClinicManager(editManagerModal.manager.id, buildManagerPayload(managerForm));
      setEditManagerModal({ isOpen: false, manager: null });
      setSuccessModal({
        isOpen: true,
        title: "Clinic Manager Updated",
        message: `${getManagerName(editManagerModal.manager)} was updated successfully.`,
      });
      resetManagerForm();
      await refreshManagers();
    } catch (err) {
      setError(err.message || "Unable to update clinic manager.");
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (!passwordModal.password || passwordModal.password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (passwordModal.password !== passwordModal.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await adminService.updateClinicManager(passwordModal.manager.id, { password: passwordModal.password });
      setPasswordModal({ isOpen: false, manager: null, password: "", confirm: "" });
      setSuccessModal({
        isOpen: true,
        title: "Password Updated",
        message: `Password for ${getManagerName(passwordModal.manager)} has been changed.`,
      });
      await refreshManagers();
    } catch (err) {
      setError(err.message || "Unable to change password.");
    }
  };

  const handleDeactivateManager = async () => {
    try {
      const response = await adminService.deactivateClinicManager(deleteManagerModal.manager.id);
      const updatedManager = response.manager || deleteManagerModal.manager;
      const isActivating = deleteManagerModal.manager.status === 'inactive';
      
      setDeleteManagerModal({ isOpen: false, manager: null });
      setSuccessModal({
        isOpen: true,
        title: isActivating ? "Clinic Manager Activated" : "Clinic Manager Deactivated",
        message: isActivating 
          ? `${getManagerName(deleteManagerModal.manager)} has been activated.${updatedManager.clinic_count === 0 ? ' Note: Please assign clinics for full access.' : ''}`
          : `${getManagerName(deleteManagerModal.manager)} no longer has clinic access.`,
      });
      await refreshManagers();
    } catch (err) {
      setError(err.message || `Unable to ${deleteManagerModal.manager.status === 'inactive' ? 'activate' : 'deactivate'} clinic manager.`);
    }
  };

  const renderAssignedClinics = (manager) => {
    const clinicsList = manager.assigned_clinics?.map((clinic) => clinic.name).join(", ");
    return clinicsList || "No clinics assigned";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clinic Manager Administration</h1>
            <p className="text-muted-foreground">Create, edit, and secure Clinic Manager accounts.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <span className="ml-3 text-muted-foreground">Loading clinic managers…</span>
              </div>
        ) : (
          <>
              <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clinic Manager Accounts</CardTitle>
                  <CardDescription>Full lifecycle management for clinic manager access.</CardDescription>
                </div>
                <Button onClick={openCreateModal}>Add Clinic Manager</Button>
                </CardHeader>
                <CardContent>
                {clinicManagers.length ? (
                  <div className="space-y-4">
                    {clinicManagers.map((manager) => (
                      <div
                        key={manager.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                      >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{getManagerName(manager)}</h3>
                            <Badge variant="outline">clinic_manager</Badge>
                            <Badge className={manager.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {manager.status || 'active'}
                            </Badge>
                            </div>
                          <p className="text-sm text-muted-foreground">{manager.email}</p>
                          {manager.phone && <p className="text-sm text-muted-foreground">{manager.phone}</p>}
                          <p className="mt-2 text-sm text-muted-foreground">Clinics: {renderAssignedClinics(manager)}</p>
                          </div>
                        <div className="flex flex-col gap-2 md:flex-row">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(manager)}>
                            Edit details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openPasswordModal(manager)}>
                            <KeyRound className="mr-1 h-4 w-4" />
                            Change password
                          </Button>
                          <Button
                            variant={manager.status === 'active' ? 'destructive' : 'default'}
                            size="sm"
                            className={manager.status === 'inactive' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}
                            style={manager.status === 'inactive' ? { backgroundColor: '#16a34a', borderColor: '#16a34a' } : {}}
                            onClick={() => setDeleteManagerModal({ isOpen: true, manager })}
                          >
                            {manager.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                    ) : (
                  <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                    No clinic managers found. Create the first one to grant access.
                      </div>
                    )}
                </CardContent>
              </Card>
          </>
        )}
      </div>

      <FormModal
        isOpen={addManagerModal}
        onClose={() => {
          setAddManagerModal(false);
          resetManagerForm();
        }}
        onCancel={() => {
          setAddManagerModal(false);
          resetManagerForm();
        }}
        title="Create Clinic Manager"
        onSubmit={handleCreateManager}
        submitText="Create Manager"
        cancelText="Cancel"
      >
        <ModalSection title="Manager information">
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="manager-first-name">First name *</Label>
                <Input
                  id="manager-first-name"
                  value={managerForm.first_name}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="manager-last-name">Last name *</Label>
                <Input
                  id="manager-last-name"
                  value={managerForm.last_name}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="manager-email">Email *</Label>
              <Input
                id="manager-email"
                type="email"
                value={managerForm.email}
                onChange={(e) => setManagerForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="manager-phone">Phone</Label>
              <Input
                id="manager-phone"
                value={managerForm.phone}
                onChange={(e) => setManagerForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="manager-password">Password (optional)</Label>
                <Input
                  id="manager-password"
                  type="password"
                  placeholder="Leave blank for default password123"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="manager-password-confirm">Confirm password</Label>
                <Input
                  id="manager-password-confirm"
                  type="password"
                  value={managerForm.confirmPassword}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Assign Clinics *</Label>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {clinics.map((clinic) => (
                  <label key={clinic.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={managerForm.clinic_ids.includes(clinic.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManagerForm((prev) => ({ ...prev, clinic_ids: [...prev.clinic_ids, clinic.id] }));
                        } else {
                          setManagerForm((prev) => ({
                            ...prev,
                            clinic_ids: prev.clinic_ids.filter((id) => id !== clinic.id),
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span>{clinic.name}</span>
                  </label>
                ))}
              </div>
          </div>
        </div>
        </ModalSection>
      </FormModal>

      <FormModal
        isOpen={editManagerModal.isOpen}
        onClose={() => {
          setEditManagerModal({ isOpen: false, manager: null });
          resetManagerForm();
        }}
        onCancel={() => {
          setEditManagerModal({ isOpen: false, manager: null });
          resetManagerForm();
        }}
        title="Edit Clinic Manager"
        onSubmit={handleUpdateManager}
        submitText="Save changes"
        cancelText="Cancel"
      >
        <ModalSection title="Manager details">
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-manager-first-name">First name *</Label>
                <Input
                  id="edit-manager-first-name"
                  value={managerForm.first_name}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-manager-last-name">Last name *</Label>
                <Input
                  id="edit-manager-last-name"
                  value={managerForm.last_name}
                  onChange={(e) => setManagerForm((prev) => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-manager-email">Email *</Label>
              <Input
                id="edit-manager-email"
                type="email"
                value={managerForm.email}
                onChange={(e) => setManagerForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Clinics *</Label>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {clinics.map((clinic) => (
                  <label key={clinic.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={managerForm.clinic_ids.includes(clinic.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManagerForm((prev) => ({ ...prev, clinic_ids: [...prev.clinic_ids, clinic.id] }));
                        } else {
                          setManagerForm((prev) => ({
                            ...prev,
                            clinic_ids: prev.clinic_ids.filter((id) => id !== clinic.id),
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span>{clinic.name}</span>
                  </label>
                ))}
              </div>
        </div>
        </div>
        </ModalSection>
      </FormModal>

      <FormModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, manager: null, password: "", confirm: "" })}
        onCancel={() => setPasswordModal({ isOpen: false, manager: null, password: "", confirm: "" })}
        title={`Change password for ${passwordModal.manager ? getManagerName(passwordModal.manager) : ""}`}
        onSubmit={handlePasswordChange}
        submitText="Update password"
        cancelText="Cancel"
      >
        <ModalSection title="Security">
        <div className="space-y-4">
          <div>
              <Label htmlFor="manager-new-password">New password *</Label>
            <Input
                id="manager-new-password"
                type="password"
                value={passwordModal.password}
                onChange={(e) => setPasswordModal((prev) => ({ ...prev, password: e.target.value }))}
                required
            />
          </div>
          <div>
              <Label htmlFor="manager-confirm-password">Confirm password *</Label>
              <Input
                id="manager-confirm-password"
                type="password"
                value={passwordModal.confirm}
                onChange={(e) => setPasswordModal((prev) => ({ ...prev, confirm: e.target.value }))}
                required
              />
          </div>
        </div>
        </ModalSection>
      </FormModal>

      <ConfirmationModal
        isOpen={deleteManagerModal.isOpen}
        onClose={() => setDeleteManagerModal({ isOpen: false, manager: null })}
        title={deleteManagerModal.manager?.status === 'active' ? 'Deactivate Clinic Manager' : 'Activate Clinic Manager'}
        message={
          deleteManagerModal.manager?.status === 'active'
            ? `Remove access for ${getManagerName(deleteManagerModal.manager)}? They will lose all clinic assignments immediately.`
            : `Activate ${getManagerName(deleteManagerModal.manager)}? Note: You may need to assign clinics for them to have full access.`
        }
        onConfirm={handleDeactivateManager}
        onCancel={() => setDeleteManagerModal({ isOpen: false, manager: null })}
        confirmText={deleteManagerModal.manager?.status === 'active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={deleteManagerModal.manager?.status === 'active' ? 'danger' : 'default'}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: "", message: "" })}
        onConfirm={() => setSuccessModal({ isOpen: false, title: "", message: "" })}
        title={successModal.title}
        message={successModal.message}
        confirmText="OK"
      />

      <LogoutConfirmationModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Admin Logout"
        message="Are you sure you want to logout from the admin dashboard?"
      />
    </div>
  );
};

export default AdminDashboard;

