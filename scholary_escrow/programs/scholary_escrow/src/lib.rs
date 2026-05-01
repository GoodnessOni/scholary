use anchor_lang::prelude::*;

declare_id!("2QyWqLBNUqhSz6ajW4UHA1YN6Wf35KCMdUmPEYBMvcNc");

#[program]
pub mod scholary_escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        total_amount: u64,
        milestone_amount: u64,
    ) -> Result<()> {
        require!(
            total_amount > 0 && milestone_amount > 0,
            EscrowError::InvalidAmount
        );
        require!(
            milestone_amount <= total_amount,
            EscrowError::MilestoneExceedsTotal
        );

        // Grab keys BEFORE any mutable borrow
        let sponsor_key = ctx.accounts.sponsor.key();
        let escrow_key = ctx.accounts.escrow_account.key();

        let escrow = &mut ctx.accounts.escrow_account;
        escrow.sponsor = sponsor_key;
        escrow.student = ctx.accounts.student.key();
        escrow.oracle = ctx.accounts.oracle.key();
        escrow.total_amount = total_amount;
        escrow.milestone_amount = milestone_amount;
        escrow.is_active = true;
        escrow.bump = ctx.bumps.escrow_account;

        // Drop mutable borrow before invoking
        drop(escrow);

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &sponsor_key,
            &escrow_key,
            total_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.sponsor.to_account_info(),
                ctx.accounts.escrow_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!(
            "Escrow initialized. Sponsor: {}, Amount: {} lamports",
            sponsor_key,
            total_amount
        );

        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        // Extract everything we need BEFORE mutable borrow
        let vault_lamports = ctx.accounts.escrow_account.to_account_info().lamports();
        let release_amount = ctx.accounts.escrow_account.milestone_amount;
        let current_total = ctx.accounts.escrow_account.total_amount;
        let student_key = ctx.accounts.escrow_account.student;
        let is_active = ctx.accounts.escrow_account.is_active;

        require!(is_active, EscrowError::EscrowInactive);
        require!(
            vault_lamports >= release_amount,
            EscrowError::InsufficientFunds
        );

        // Move lamports directly
        **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -= release_amount;
        **ctx.accounts.student.to_account_info().try_borrow_mut_lamports()? += release_amount;

        // Now do the mutable borrow to update state
        let new_total = current_total
            .checked_sub(release_amount)
            .ok_or(EscrowError::Underflow)?;

        ctx.accounts.escrow_account.total_amount = new_total;

        if new_total == 0 {
            ctx.accounts.escrow_account.is_active = false;
        }

        msg!(
            "Funds released: {} lamports to student {}",
            release_amount,
            student_key
        );

        Ok(())
    }

    pub fn refund_sponsor(ctx: Context<RefundSponsor>) -> Result<()> {
        // Extract everything we need BEFORE mutable borrow
        let vault_balance = ctx.accounts.escrow_account.to_account_info().lamports();
        let is_active = ctx.accounts.escrow_account.is_active;
        let sponsor_key = ctx.accounts.escrow_account.sponsor;

        require!(is_active, EscrowError::EscrowInactive);

        let rent_exempt_minimum = Rent::get()?.minimum_balance(EscrowAccount::LEN);
        let refund_amount = vault_balance
            .checked_sub(rent_exempt_minimum)
            .ok_or(EscrowError::InsufficientFunds)?;

        require!(refund_amount > 0, EscrowError::NothingToRefund);

        // Move lamports directly
        **ctx.accounts.escrow_account.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.sponsor.to_account_info().try_borrow_mut_lamports()? += refund_amount;

        // Update state
        ctx.accounts.escrow_account.is_active = false;
        ctx.accounts.escrow_account.total_amount = 0;

        msg!(
            "Refund of {} lamports returned to sponsor {}",
            refund_amount,
            sponsor_key
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,

    /// CHECK: Student pubkey stored for later payout
    pub student: UncheckedAccount<'info>,

    /// CHECK: Oracle pubkey stored for later authorization
    pub oracle: UncheckedAccount<'info>,

    #[account(
        init,
        payer = sponsor,
        space = 8 + EscrowAccount::LEN,
        seeds = [b"escrow", sponsor.key().as_ref(), student.key().as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        mut,
        constraint = oracle.key() == escrow_account.oracle @ EscrowError::UnauthorizedOracle
    )]
    pub oracle: Signer<'info>,

    /// CHECK: Validated against stored student pubkey via constraint
    #[account(
        mut,
        constraint = student.key() == escrow_account.student @ EscrowError::StudentMismatch
    )]
    pub student: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.sponsor.as_ref(), student.key().as_ref()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundSponsor<'info> {
    #[account(
        mut,
        constraint = oracle.key() == escrow_account.oracle @ EscrowError::UnauthorizedOracle
    )]
    pub oracle: Signer<'info>,

    /// CHECK: Validated against stored sponsor pubkey via constraint
    #[account(
        mut,
        constraint = sponsor.key() == escrow_account.sponsor @ EscrowError::SponsorMismatch
    )]
    pub sponsor: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"escrow", sponsor.key().as_ref(), escrow_account.student.as_ref()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowAccount {
    pub sponsor: Pubkey,
    pub student: Pubkey,
    pub oracle: Pubkey,
    pub total_amount: u64,
    pub milestone_amount: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl EscrowAccount {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 1 + 1;
}

#[error_code]
pub enum EscrowError {
    #[msg("Only the designated oracle can authorize this action.")]
    UnauthorizedOracle,
    #[msg("Student account does not match the escrow record.")]
    StudentMismatch,
    #[msg("Sponsor account does not match the escrow record.")]
    SponsorMismatch,
    #[msg("The escrow is no longer active.")]
    EscrowInactive,
    #[msg("Amount must be greater than zero.")]
    InvalidAmount,
    #[msg("Milestone amount cannot exceed total escrow amount.")]
    MilestoneExceedsTotal,
    #[msg("Insufficient funds in the vault for this operation.")]
    InsufficientFunds,
    #[msg("No remaining balance to refund.")]
    NothingToRefund,
    #[msg("Arithmetic underflow during fund calculation.")]
    Underflow,
}npm run dev -- --port 3000 --host