import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useProfile } from './hooks/useProfile';
import { profileSchema, type ProfileFormData } from './schemas/profile.schema';
import { AvatarUpload } from './components/AvatarUpload';

export const ProfilePage = () => {
  const { profile, isLoading, isUpdating, fetchProfile, updateProfile } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: '',
      lastName: '',
      phone: '',
    },
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile().catch((err) => {
      toast.error(err.message || 'Error al obtener los datos del perfil');
    });
  }, [fetchProfile]);

  // Reset form values once profile is loaded
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data, selectedFile);
      setSelectedFile(null); // Clear selected file upon success
      toast.success('Perfil actualizado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-brand-accent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-brand-text animate-pulse">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-accent tracking-tight">Mi Perfil</h1>
            <p className="mt-1 text-sm text-brand-text">Administra tu información personal y foto de perfil</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 border border-brand-primary rounded-lg text-brand-text hover:bg-brand-primary/20 hover:text-brand-accent transition-all duration-300 font-medium text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la Tienda
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar upload */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-brand-primary/40 shadow-sm flex flex-col justify-center items-center h-fit">
            <AvatarUpload
              currentAvatarUrl={profile?.avatarUrl ?? null}
              name={profile?.name || ''}
              lastName={profile?.lastName || ''}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>

          {/* Right Column: Editable Profile Fields Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-brand-primary/40 shadow-sm p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Visual Organizer Section 1 */}
              <div>
                <h3 className="text-md font-bold text-brand-accent uppercase tracking-wider mb-1">
                  Información Personal
                </h3>
                <p className="text-xs text-brand-text mb-4">
                  Esta información se utilizará para personalizar tu experiencia.
                </p>
                <div className="h-[1px] bg-brand-primary/40 mb-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                      Nombre
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium bg-brand-bg/10 text-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all duration-300
                        ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-brand-primary/60 focus:border-brand-accent'}`}
                      placeholder="Ingresa tu nombre"
                      {...register('name')}
                    />
                    {errors.name && (
                      <span className="text-xs text-red-500 font-medium">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Last Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lastName" className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                      Apellido
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium bg-brand-bg/10 text-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all duration-300
                        ${errors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-brand-primary/60 focus:border-brand-accent'}`}
                      placeholder="Ingresa tu apellido"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <span className="text-xs text-red-500 font-medium">{errors.lastName.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Organizer Section 2 */}
              <div className="pt-4">
                <h3 className="text-md font-bold text-brand-accent uppercase tracking-wider mb-1">
                  Contacto y Seguridad
                </h3>
                <p className="text-xs text-brand-text mb-4">
                  Detalles de seguridad de tu cuenta e-commerce.
                </p>
                <div className="h-[1px] bg-brand-primary/40 mb-6"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium bg-brand-bg/10 text-brand-accent focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all duration-300
                        ${errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-brand-primary/60 focus:border-brand-accent'}`}
                      placeholder="+51999888777"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <span className="text-xs text-red-500 font-medium">{errors.phone.message}</span>
                    )}
                  </div>

                  {/* Email Input (Disabled / Safe Lock) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                      Correo Electrónico
                      <svg
                        className="w-3.5 h-3.5 text-brand-text/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full px-4 py-2.5 rounded-lg border border-brand-primary/40 text-sm font-medium bg-brand-bg/60 text-brand-text cursor-not-allowed select-none"
                    />
                    <span className="text-[10px] text-brand-text/60">
                      El correo electrónico no puede ser modificado por seguridad.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="h-[1px] bg-brand-primary/40 pt-4"></div>
              
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (profile) {
                      reset({
                        name: profile.name,
                        lastName: profile.lastName || '',
                        phone: profile.phone || '',
                      });
                      setSelectedFile(null);
                      toast.success('Cambios revertidos');
                    }
                  }}
                  disabled={!isDirty && !selectedFile}
                  className="px-5 py-2.5 border border-brand-primary text-sm font-semibold rounded-lg text-brand-text hover:bg-brand-primary/20 hover:text-brand-accent disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-text transition-all duration-300"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={isUpdating || (!isDirty && !selectedFile)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-brand-accent hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
