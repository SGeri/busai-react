import React from "react";
import InlineError from "../messages/InlineError";
import { Button, Dropdown, Form, Message, Modal } from "semantic-ui-react";
import axios from "axios";

import Navbar from "../menus/Navbar";
import * as DropdownOptions from "../models/DropdownOptions";

class NewItemPage extends React.Component {
  state = {
    data: {
      thumbnail: "",
      name: "",
      barcode: "",
      reorderQuantity: undefined,
      unit: "",
      netPurchasePrice: undefined,
      grossPurchasePrice: undefined,
      netSellPrice: undefined,
      grossSellPrice: undefined,
      vat: 27,
      profitPercent: undefined,
      stock: "",
      supplier: "",
    },
    errors: {},
    hasLocalErrors: false,
    loading: false,
    confirm: false,
  };

  onChange = (e) => {
    const vat = this.state.data.vat;

    if (e.target.value == 0) {
      this.setState({
        data: {
          [e.target.name]: undefined,
        },
      });
    }

    if (
      vat &&
      this.state.data.grossSellPrice &&
      e.target.name == "netPurchasePrice"
    ) {
      this.setState({
        data: {
          ...this.state.data,
          grossPurchasePrice: e.target.value * (vat / 100 + 1),
          netSellPrice: this.state.data.grossSellPrice / (vat / 100 + 1),
          profitPercent:
            (this.state.data.grossSellPrice / (vat / 100 + 1) / e.target.value -
              1) *
            100,
          [e.target.name]: e.target.value,
        },
      });
    } else if (
      vat &&
      this.state.data.netPurchasePrice &&
      e.target.name == "grossSellPrice"
    ) {
      this.setState({
        data: {
          ...this.state.data,
          grossPurchasePrice:
            this.state.data.netPurchasePrice * (vat / 100 + 1),
          netSellPrice: e.target.value / (vat / 100 + 1),
          profitPercent:
            (e.target.value /
              (vat / 100 + 1) /
              this.state.data.netPurchasePrice -
              1) *
            100,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      this.setState({
        data: {
          ...this.state.data,
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  onDropdownChange = (e, data) => {
    this.setState({
      data: { ...this.state.data, [data.name]: data.value },
    });
  };

  validate = (data) => {
    const errors = {};

    if (!data.thumbnail) errors.thumbnail = "Nem lehet üres";
    if (!data.name) errors.name = "Nem lehet üres";
    if (!data.barcode) errors.barcode = "Nem lehet üres";
    if (!data.reorderQuantity) errors.reorderQuantity = "Nem lehet üres";
    if (!data.unit) errors.unit = "Nem lehet üres";
    if (!data.netPurchasePrice) errors.netPurchasePrice = "Nem lehet üres";
    if (!data.grossPurchasePrice) errors.grossPurchasePrice = "Nem lehet üres";
    if (!data.netSellPrice) errors.netSellPrice = "Nem lehet üres";
    if (!data.grossSellPrice) errors.grossSellPrice = "Nem lehet üres";
    if (!data.vat) errors.vat = "Nem lehet üres";
    if (data.profitPercent <= 0)
      errors.profitPercent =
        "A beszerzési ár nem lehet nagyobb az eladási árnál";
    if (!data.profitPercent) errors.profitPercent = "Nem lehet üres";
    if (!data.stock) errors.stock = "Nem lehet üres";
    if (!data.supplier) errors.supplier = "Nem lehet üres";

    if (Object.keys(errors).length !== 0)
      this.setState({ hasLocalErrors: true });
    else this.setState({ hasLocalErrors: false });

    return errors;
  };

  onSubmit = () => {
    const errors = this.validate(this.state.data);
    const data = this.state.data;
    this.setState({ errors });

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    this.setState({ loading: true });
    axios
      .post(
        "http://88.151.99.76:4000/api/add_item",
        { data },
        {
          headers: {
            Authorization: "Bearer " + localStorage.BUSAIWAREHOUSE_JWT,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          this.setState({ success: true });
        } else {
          this.setState({ errors: res.data.errors });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  openConfirm = () => {
    this.setState({ confirm: true });
  };

  closeConfirm = () => {
    this.setState({ confirm: false });
  };

  saveConfirm = () => {
    this.onSubmit();
    this.closeConfirm();
  };

  render() {
    const {
      data,
      loading,
      errors,
      success,
      confirm,
      hasLocalErrors,
    } = this.state;

    return (
      <div style={{ paddingBottom: "100px" }}>
        <Navbar />
        <h1>Új termék létrehozása</h1>

        <Modal open={confirm}>
          <Modal.Header>Megerősítés</Modal.Header>
          <Modal.Content>
            <h3>Biztosan folytatod a műveletet?</h3>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={this.closeConfirm}>
              Mégsem
            </Button>
            <Button
              content="Igen"
              labelPosition="right"
              icon="checkmark"
              onClick={this.saveConfirm}
              positive
            />
          </Modal.Actions>
        </Modal>

        <Form loading={loading}>
          <Form.Field error={!!errors.thumbnail}>
            <label htmlFor="thumbnail">Kép URL</label>
            <input
              type="text"
              id="thumbnail"
              name="thumbnail"
              placeholder="pl.: huroc.com/kep.jpg"
              value={data.thumbnail}
              onChange={this.onChange}
            />
            {errors.thumbnail && <InlineError text={errors.thumbnail} />}
          </Form.Field>
          <Form.Field error={!!errors.name}>
            <label htmlFor="name">Termék neve</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="pl.: Ragasztószalag"
              value={data.name}
              onChange={this.onChange}
            />
            {errors.name && <InlineError text={errors.name} />}
          </Form.Field>
          <Form.Field error={!!errors.barcode}>
            <label htmlFor="barcode">Vonalkód</label>
            <input
              type="number"
              id="barcode"
              name="barcode"
              placeholder="pl.: 0000000000017"
              value={data.barcode}
              onChange={this.onChange}
            />
            {errors.barcode && <InlineError text={errors.barcode} />}
          </Form.Field>
          <Form.Field error={!!errors.reorderQuantity}>
            <label htmlFor="reorderQuantity">Min. mennyiség</label>
            <input
              type="number"
              id="reorderQuantity"
              name="reorderQuantity"
              placeholder="pl.: 10"
              value={data.reorderQuantity}
              onChange={this.onChange}
            />
            {errors.reorderQuantity && (
              <InlineError text={errors.reorderQuantity} />
            )}
          </Form.Field>
          <Form.Field error={!!errors.stock}>
            <label htmlFor="stock">Jelenlegi készlet</label>
            <input
              type="number"
              id="stock"
              name="stock"
              placeholder="pl.: 50"
              value={data.stock}
              onChange={this.onChange}
            />
            {errors.stock && <InlineError text={errors.stock} />}
          </Form.Field>
          <Form.Field error={!!errors.unit}>
            <label htmlFor="unit">Mennyiség egysége</label>
            <Dropdown
              value={data.unit}
              onChange={this.onDropdownChange}
              name="unit"
              placeholder="Válassz a menüből"
              fluid
              selection
              options={DropdownOptions.unitDropdownOptions}
            />
            {errors.unit && <InlineError text={errors.unit} />}
          </Form.Field>
          <Form.Field error={!!errors.vat}>
            <label htmlFor="vat">Áfa</label>
            <Dropdown
              value={data.vat}
              defaultValue={27}
              onChange={this.onDropdownChange}
              name="vat"
              placeholder="Válassz a menüből"
              fluid
              selection
              options={DropdownOptions.vatDropdownOptions}
            />
            {errors.vat && <InlineError text={errors.vat} />}
          </Form.Field>
          <Form.Field error={!!errors.profitPercent}>
            <label htmlFor="profitPercent">Haszonkulcs (%)</label>
            <input
              type="number"
              id="profitPercent"
              name="profitPercent"
              placeholder="pl.: 100"
              value={Math.round(data.profitPercent * 100) / 100}
              onChange={this.onChange}
            />
            {errors.profitPercent && (
              <InlineError text={errors.profitPercent} />
            )}
          </Form.Field>
          <Form.Field error={!!errors.netPurchasePrice}>
            <label htmlFor="netPurchasePrice">Nettó beszerzési ár</label>
            <input
              type="number"
              id="netPurchasePrice"
              name="netPurchasePrice"
              placeholder="pl.: 1000"
              value={Math.round(data.netPurchasePrice * 100) / 100}
              onChange={this.onChange}
            />
            {errors.netPurchasePrice && (
              <InlineError text={errors.netPurchasePrice} />
            )}
          </Form.Field>
          <Form.Field error={!!errors.grossPurchasePrice}>
            <label htmlFor="grossPurchasePrice">Bruttó beszerzési ár</label>
            <input
              type="number"
              id="grossPurchasePrice"
              name="grossPurchasePrice"
              placeholder="pl.: 1270"
              value={Math.round(data.grossPurchasePrice * 100) / 100}
              onChange={this.onChange}
            />
            {errors.grossPurchasePrice && (
              <InlineError text={errors.grossPurchasePrice} />
            )}
          </Form.Field>
          <Form.Field error={!!errors.netSellPrice}>
            <label htmlFor="netSellPrice">Nettó eladási ár</label>
            <input
              type="number"
              id="netSellPrice"
              name="netSellPrice"
              placeholder="pl.: 2000"
              value={Math.round(data.netSellPrice * 100) / 100}
              onChange={this.onChange}
            />
            {errors.netSellPrice && <InlineError text={errors.netSellPrice} />}
          </Form.Field>
          <Form.Field error={!!errors.grossSellPrice}>
            <label htmlFor="grossSellPrice">Bruttó eladási ár</label>
            <input
              type="number"
              id="grossSellPrice"
              name="grossSellPrice"
              placeholder="pl.: 2540"
              value={Math.round(data.grossSellPrice * 100) / 100}
              onChange={this.onChange}
            />
            {errors.grossSellPrice && (
              <InlineError text={errors.grossSellPrice} />
            )}
          </Form.Field>
          <Form.Field error={!!errors.supplier}>
            <label htmlFor="supplier">Beszállító</label>
            <Dropdown
              value={data.supplier}
              onChange={this.onDropdownChange}
              name="supplier"
              placeholder="Válassz a menüből"
              fluid
              selection
              options={DropdownOptions.supplierDropdownOptions}
            />
            {errors.supplier && <InlineError text={errors.supplier} />}
          </Form.Field>

          {errors.global && (
            <Message negative>
              <Message.Header>Valami hiba történt</Message.Header>
              <p>{errors.global}</p>
            </Message>
          )}

          {success && (
            <Message positive>
              <Message.Header>Termék mentésre került</Message.Header>
              <p>A terméket sikeresen feltöltötted az adatbázisba</p>
            </Message>
          )}

          {hasLocalErrors && (
            <Message negative>
              <Message.Header>Hiba történt</Message.Header>
              <p>Valamelyik mező üresen maradt</p>
            </Message>
          )}
        </Form>

        <Button
          style={{ marginTop: "20px", marginBottom: "70px" }}
          primary
          sub="true"
          onClick={this.openConfirm}
        >
          Mentés
        </Button>
      </div>
    );
  }
}

export default NewItemPage;
