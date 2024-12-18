interface BillAmountProps {
  amount: number;
  selectedProfiles: string[];
}

export const BillAmount = ({ amount, selectedProfiles }: BillAmountProps) => {
  const amountPerPerson = selectedProfiles.length > 0 
    ? amount / selectedProfiles.length 
    : amount;

  return (
    <>
      <p className="text-lg font-semibold text-primary">
        ${amount.toFixed(2)}
      </p>
      {selectedProfiles.length > 1 && (
        <p className="text-sm text-muted-foreground">
          ${amountPerPerson.toFixed(2)} por persona
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