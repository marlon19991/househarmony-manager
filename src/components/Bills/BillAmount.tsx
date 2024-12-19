interface BillAmountProps {
  amount: number;
  selectedProfiles: string[];
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('es-ES').format(amount);
};

export const BillAmount = ({ amount, selectedProfiles }: BillAmountProps) => {
  const amountPerPerson = selectedProfiles.length > 0 
    ? amount / selectedProfiles.length 
    : amount;

  return (
    <>
      <p className="text-lg font-semibold text-primary">
        ${formatAmount(amount)}
      </p>
      {selectedProfiles.length > 1 && (
        <p className="text-sm text-muted-foreground">
          ${formatAmount(amountPerPerson)} por persona
        </p>
      )}
      {selectedProfiles.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Dividido entre {selectedProfiles.length} persona(s)
        </p>
      )}
    </>
  );
};