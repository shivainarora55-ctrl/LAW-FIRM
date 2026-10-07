import PageHeading from "@/components/portal/PageHeading/PageHeading";
import ProfileForm from "@/components/portal/ProfileForm/ProfileForm";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm/ChangePasswordForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageHeading title="My Profile" description="Keep your contact details current so the office can reach you about your matters." />
      <section aria-labelledby="profile-details-heading" className="mb-10"><h2 id="profile-details-heading" className="mb-5 text-xl font-medium">Profile details</h2><ProfileForm user={user} /></section>
      <section aria-labelledby="change-password-heading" className="border-t border-line pt-8"><h2 id="change-password-heading" className="mb-2 text-xl font-medium">Change password</h2><p className="mb-5 text-sm text-muted">Choose a password with at least eight characters, including a letter and a number.</p><ChangePasswordForm /></section>
    </>
  );
}
