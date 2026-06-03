"""
Distillates East-West Arbitrage Calculator
===========================================

Geographic arbitrage model for middle distillates (Gasoil 10ppm / Jet-Kero)
moving from Singapore (East) to Rotterdam (West).

    Net Arbitrage P&L = (Rotterdam − Singapore) − (Freight + Storage & Financing)

A positive value means the trade is economically attractive; negative means
the arb is closed. The Maintenance Margin field captures the capital cost
absorbed by the clearing house requirement.

Run with:  streamlit run app.py
"""

import streamlit as st

# --------------------------------------------------------------------------- #
# Page configuration & styling
# --------------------------------------------------------------------------- #

st.set_page_config(
    page_title="Distillates East-West Arbitrage",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {padding-top: 2.5rem; max-width: 1100px;}
    </style>
    """,
    unsafe_allow_html=True,
)


# --------------------------------------------------------------------------- #
# Authentication
# --------------------------------------------------------------------------- #

_CORRECT_PASSWORD = st.secrets["app_password"]

if "authenticated" not in st.session_state:
    st.session_state.authenticated = False

if not st.session_state.authenticated:
    _, col, _ = st.columns([1.5, 1, 1.5])
    with col:
        st.markdown("#### Trade Cruiser")
        st.caption("Restricted access. Authorized personnel only.")
        st.write("")
        with st.form("login_form"):
            pwd = st.text_input("Password", type="password")
            submitted = st.form_submit_button("Access", use_container_width=True)
        if submitted:
            if pwd == _CORRECT_PASSWORD:
                st.session_state.authenticated = True
                st.rerun()
            else:
                st.error("Incorrect password. Access denied.")
    st.stop()


# --------------------------------------------------------------------------- #
# Sidebar — inputs
# --------------------------------------------------------------------------- #

with st.sidebar:
    st.markdown(
        """
        <p style="
            font-size: 0.70rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 0.1rem;
        ">Trade Cruiser</p>
        """,
        unsafe_allow_html=True,
    )
    st.divider()
    st.subheader("Parameters")

    st.markdown("**Market prices**")
    rtm_price = st.number_input(
        "Rotterdam price (USD/mt)",
        min_value=0.0,
        value=760.00,
        step=1.0,
        format="%.2f",
    )
    sing_price = st.number_input(
        "Singapore price (USD/mt)",
        min_value=0.0,
        value=710.00,
        step=1.0,
        format="%.2f",
    )

    st.markdown("**Costs**")
    freight = st.number_input(
        "Maritime freight (USD/mt)",
        min_value=0.0,
        value=42.00,
        step=0.50,
        format="%.2f",
    )
    storage_financing = st.number_input(
        "Storage & financing (USD/mt)",
        min_value=0.0,
        value=8.00,
        step=0.50,
        format="%.2f",
    )

    st.markdown("**Capital**")
    maintenance_margin = st.number_input(
        "Maintenance margin (USD/mt)",
        min_value=0.0,
        value=15.00,
        step=0.50,
        format="%.2f",
        help="Margin required by the clearing house; not a P&L cost but a capital absorption indicator.",
    )


# --------------------------------------------------------------------------- #
# Calculation logic
# --------------------------------------------------------------------------- #

gross_spread = rtm_price - sing_price
total_costs  = freight + storage_financing
net_arb_pnl  = gross_spread - total_costs
# maintenance_margin is held as an informational input; it is NOT deducted
# from the net P&L — it reflects capital tied up, not a direct transaction cost.


# --------------------------------------------------------------------------- #
# Page header
# --------------------------------------------------------------------------- #

st.title("Distillates East-West Arbitrage")
st.caption("Singapore  →  Rotterdam   ·   indicative P&L model")

st.divider()

# --------------------------------------------------------------------------- #
# Results — metric row
# --------------------------------------------------------------------------- #

col1, col2, col3 = st.columns(3)

col1.metric(
    label="Gross Spread",
    value=f"${gross_spread:,.2f} /mt",
)
col2.metric(
    label="Total Costs",
    value=f"${total_costs:,.2f} /mt",
)
col3.metric(
    label="Net Arbitrage P&L",
    value=f"${net_arb_pnl:,.2f} /mt",
    delta=f"{net_arb_pnl:,.2f}",
    delta_color="normal",
)

# --------------------------------------------------------------------------- #
# Decision statement
# --------------------------------------------------------------------------- #

if net_arb_pnl >= 0:
    st.success(
        f"With a spread of ${gross_spread:,.2f}/mt, the arbitrage is profitable "
        f"after subtracting ${total_costs:,.2f}/mt in logistics costs. "
        f"Net P&L: ${net_arb_pnl:,.2f} per metric tonne."
    )
else:
    st.error(
        f"With a spread of ${gross_spread:,.2f}/mt, the arbitrage does not cover "
        f"${total_costs:,.2f}/mt in logistics costs. "
        f"Net P&L: ${net_arb_pnl:,.2f} per metric tonne. The trade is uneconomical and not viable."
    )

st.caption(
    f"Maintenance margin required by the clearing house: ${maintenance_margin:,.2f}/mt  "
    f"(capital absorption — not included in P&L)."
)
