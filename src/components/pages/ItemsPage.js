import React from "react";
import axios from "axios";
import {
  Table,
  Segment,
  Dimmer,
  Loader,
  Image,
  Label,
  Form,
  Message,
  Button,
  Modal,
  Dropdown,
  Input,
} from "semantic-ui-react";
import InlineError from "../messages/InlineError";

import * as DropdownOptions from "../models/DropdownOptions";
import Navbar from "../menus/Navbar";

class ItemsPage extends React.Component {
  state = {
    itemTypes: [],
    loading: false,

    isEditing: false,
    edit: {
      data: {
        name: "",
        thumbnail: "",
        barcode: "",
        reorderQuantity: undefined,
        unit: "",
        netPurchasePrice: undefined,
        grossPurchasePrice: undefined,
        netSellPrice: undefined,
        grossSellPrice: undefined,
        vat: 27,
        profitPercent: undefined,
        stock: undefined,
        supplier: "",
      },
      loading: false,
      errors: {},
    },

    confirm: {
      open: false,
      type: "",
    },

    search: {
      value: "",
      loading: false,
    },

    isSorted: false,
  };

  async componentDidMount() {
    await this.loadItems();
  }

  loadItems() {
    this.setState({ loading: true });
    axios
      .post(
        "http://88.151.99.76:4000/api/get_items",
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.BUSAIWAREHOUSE_JWT,
          },
        }
      )
      .then((res) => {
        this.setState({ itemTypes: res.data, fullItemTypes: res.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  editItem = (partNumber) => {
    let res = this.state.itemTypes.find(
      (item) => item.partNumber === partNumber
    );

    this.setState({
      ...this.state,
      edit: {
        ...this.state.edit,
        data: {
          originalPartNumber: partNumber,
          partNumber: res.partNumber,
          thumbnail: res.thumbnail,
          name: res.name,
          barcode: res.barcode,
          reorderQuantity: res.reorderQuantity,
          unit: res.unit,
          netPurchasePrice: res.netPurchasePrice,
          grossPurchasePrice: res.grossPurchasePrice,
          netSellPrice: res.netSellPrice,
          grossSellPrice: res.grossSellPrice,
          vat: res.vat,
          profitPercent: res.profitPercent,
          stock: res.stock,
          supplier: res.supplier,
        },
        editTitle: res.name,
      },
      isEditing: true,
    });
  };

  deleteItem = async () => {
    await axios
      .post(
        "http://88.151.99.76:4000/api/delete_item",
        { partNumber: this.state.selectedItemPartNumber },
        {
          headers: {
            Authorization: "Bearer " + localStorage.BUSAIWAREHOUSE_JWT,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          this.setState({
            edit: { success: true },
          });
        } else {
          this.setState({
            errors: res.data.errors,
          });
        }
      });
  };

  onChange = (e) => {
    const vat = this.state.edit.data.vat;

    if (e.target.value == 0) {
      this.setState({
        edit: {
          ...this.state.edit,
          data: {
            [e.target.name]: undefined,
          },
        },
      });
    }

    if (
      vat &&
      this.state.edit.data.grossSellPrice &&
      e.target.name == "netPurchasePrice"
    ) {
      this.setState({
        edit: {
          ...this.state.edit,
          data: {
            ...this.state.edit.data,
            grossPurchasePrice: e.target.value * (vat / 100 + 1),
            netSellPrice: this.state.edit.data.grossSellPrice / (vat / 100 + 1),
            profitPercent:
              (this.state.edit.data.grossSellPrice /
                (vat / 100 + 1) /
                e.target.value -
                1) *
              100,
            [e.target.name]: e.target.value,
          },
        },
      });
    } else if (
      vat &&
      this.state.edit.data.netPurchasePrice &&
      e.target.name == "grossSellPrice"
    ) {
      this.setState({
        edit: {
          ...this.state.edit,
          data: {
            ...this.state.edit.data,
            grossPurchasePrice:
              this.state.edit.data.netPurchasePrice * (vat / 100 + 1),
            netSellPrice: e.target.value / (vat / 100 + 1),
            profitPercent:
              (e.target.value /
                (vat / 100 + 1) /
                this.state.edit.data.netPurchasePrice -
                1) *
              100,
            [e.target.name]: e.target.value,
          },
        },
      });
    } else {
      this.setState({
        edit: {
          ...this.state.edit,
          data: {
            ...this.state.edit.data,
            [e.target.name]: e.target.value,
          },
        },
      });
    }
  };

  onDropdownChange = (e, data) => {
    this.setState({
      edit: {
        ...this.state.edit,
        data: { ...this.state.edit.data, [data.name]: data.value },
      },
    });
  };

  onSearchChange = (e, data) => {
    this.setState({ search: { ...this.state.search, value: data.value } });

    let searchedItems = this.state.fullItemTypes.filter((item) => {
      return (
        item.name.toLowerCase().includes(data.value.toLowerCase()) ||
        item.barcode.includes(data.value.toLowerCase())
      );
    });

    if (data.value.length != 0) {
      this.setState({
        itemTypes: searchedItems,
      });
    } else {
      this.setState({
        itemTypes: this.state.fullItemTypes,
      });
    }
  };

  validate = (data) => {
    const errors = {};

    if (!data.thumbnail) errors.thumbnail = "Nem lehet üres";
    if (!data.name) errors.name = "Nem lehet üres";
    if (!data.barcode) errors.barcode = "Nem lehet üres";
    if (!data.reorderQuantity) errors.reorderQuantity = "Nem lehet üres";
    if (!data.unit) errors.unit = "Nem lehet üres";
    if (!data.netPurchasePrice) errors.netPurchasePrice = "Nem lehet üres";
    if (!data.grossPurchasePrice) errors.PurchasePrice = "Nem lehet üres";
    if (!data.netSellPrice) errors.netSellPrice = "Nem lehet üres";
    if (!data.grossSellPrice) errors.grossSellPrice = "Nem lehet üres";
    if (!data.vat) errors.vat = "Nem lehet üres";
    if (!data.profitPercent) errors.profitPercent = "Nem lehet üres";
    if (!data.stock) errors.stock = "Nem lehet üres";
    if (!data.supplier) errors.supplier = "Nem lehet üres";

    return errors;
  };

  onSubmit = async () => {
    const errors = this.validate(this.state.edit.data);
    const data = this.state.edit.data;
    this.setState({ edit: { ...this.state.edit, errors } });

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    this.setState({ edit: { ...this.state.edit, loading: true } });
    await axios
      .post(
        "http://88.151.99.76:4000/api/edit_item",
        { data },
        {
          headers: {
            Authorization: "Bearer " + localStorage.BUSAIWAREHOUSE_JWT,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          this.setState({
            edit: { ...this.state.edit, success: true },
            isEditing: false,
          });

          const updatedItemType = this.state.itemTypes.find(
            (item) => item.partNumber == this.state.edit.data.partNumber
          );

          Object.entries(this.state.edit.data).forEach((pair) => {
            updatedItemType[pair[0]] = this.state.edit.data[pair[0]];
          });
        } else {
          this.setState({
            edit: { ...this.state.edit, errors: res.data.errors },
          });
        }
      });
    this.setState({ edit: { ...this.state.edit, loading: false } });
  };

  openDialog = () => {
    this.setState({ confirm: { ...this.state.confirm, open: true } });
  };

  sortNames = () => {
    this.state.itemTypes.sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim())
    );
    this.setState({ itemTypes: this.state.itemTypes, isSorted: true });
  };

  render() {
    const {
      loading,
      itemTypes,
      edit,
      isEditing,
      confirm,
      search,
      isSorted,
    } = this.state;

    let tableRows = itemTypes.map((item, index) => {
      return (
        <Table.Row key={index}>
          <Table.Cell style={{ alignText: "center" }}>{index + 1}.</Table.Cell>
          <Table.Cell>
            <Image width={"70px"} height={"40px"} src={item.thumbnail} />
          </Table.Cell>
          <Table.Cell>{item.name}</Table.Cell>
          <Table.Cell>
            {item.stock} {item.unit}
          </Table.Cell>
          <Table.Cell>
            {item.reorderQuantity} {item.unit}
          </Table.Cell>
          <Table.Cell>{item.supplier}</Table.Cell>
          <Table.Cell>
            <Label
              style={{ color: "#f0ad4e" }}
              onClick={async () => {
                this.editItem(item.partNumber);
                await this.setState({
                  confirm: {
                    ...this.state.confirm,
                    type: "módosítani",
                  },
                });

                window.scrollTo(0, 0);
              }}
            >
              Módosítás
            </Label>

            <Label
              style={{ color: "#bb2124" }}
              onClick={async () => {
                await this.setState({
                  selectedItemPartNumber: item.partNumber,
                  confirm: {
                    ...this.state.confirm,
                    type: "törölni",
                  },
                });

                this.openDialog();
              }}
            >
              Törlés
            </Label>
          </Table.Cell>
        </Table.Row>
      );
    });

    return (
      <div style={{ paddingBottom: "100px" }}>
        <Navbar />
        <h1>Termékek</h1>

        <Button
          style={{ position: "fixed", right: "10px", top: "90%" }}
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          ▲
        </Button>

        <Input
          loading={search.loading}
          onChange={this.onSearchChange}
          value={search.value}
          placeholder={"Keresés név vagy vonalkód alapján"}
          style={{ width: "30%" }}
        />

        <Modal open={confirm.open}>
          <Modal.Header>Megerősítés</Modal.Header>
          <Modal.Content>
            <h3>Biztosan {this.state.confirm.type} akarod ezt a terméket?</h3>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="black"
              onClick={() => {
                this.setState({
                  confirm: { ...this.state.confirm, open: false },
                });
              }}
            >
              Mégsem
            </Button>
            <Button
              content="Igen"
              labelPosition="right"
              icon="checkmark"
              onClick={() => {
                if (this.state.confirm.type == "törölni") {
                  this.deleteItem();
                  this.setState({
                    confirm: { ...this.state.confirm, open: false },
                  });
                } else {
                  this.onSubmit();
                  this.setState({
                    confirm: { ...this.state.confirm, open: false },
                  });
                }
              }}
              positive
            />
          </Modal.Actions>
        </Modal>

        {edit.success && (
          <Message positive>
            <Message.Header>Termék mentésre került</Message.Header>
            <p>A terméket sikeresen módosítottad / törölted az adatbázisból</p>
          </Message>
        )}

        {isEditing && (
          <div style={{ paddingTop: "10px" }}>
            <Segment>
              <h1>'{edit.editTitle}' termék módosítása</h1>
              <Form onSubmit={this.openDialog} loading={edit.loading}>
                <Form.Field error={!!edit.errors.thumbnail}>
                  <label htmlFor="thumbnail">Kép URL</label>
                  <input
                    type="text"
                    id="thumbnail"
                    name="thumbnail"
                    placeholder="thumbnail"
                    value={edit.data.thumbnail}
                    onChange={this.onChange}
                  />
                  {edit.errors.thumbnail && (
                    <InlineError text={edit.errors.thumbnail} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.name}>
                  <label htmlFor="name">Termék neve</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="name"
                    value={edit.data.name}
                    onChange={this.onChange}
                  />
                  {edit.errors.name && <InlineError text={edit.errors.name} />}
                </Form.Field>

                <Form.Field error={!!edit.errors.barcode}>
                  <label htmlFor="barcode">Vonalkód</label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    placeholder="barcode"
                    value={edit.data.barcode}
                    onChange={this.onChange}
                  />
                  {edit.errors.barcode && (
                    <InlineError text={edit.errors.barcode} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.reorderQuantity}>
                  <label htmlFor="reorderQuantity">Min. mennyiség</label>
                  <input
                    type="text"
                    id="reorderQuantity"
                    name="reorderQuantity"
                    placeholder="reorderQuantity"
                    value={edit.data.reorderQuantity}
                    onChange={this.onChange}
                  />
                  {edit.errors.reorderQuantity && (
                    <InlineError text={edit.errors.reorderQuantity} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.stock}>
                  <label htmlFor="stock">Jelenlegi készlet</label>
                  <input
                    type="text"
                    id="stock"
                    name="stock"
                    placeholder="stock"
                    value={edit.data.stock}
                    onChange={this.onChange}
                  />
                  {edit.errors.stock && (
                    <InlineError text={edit.errors.stock} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.unit}>
                  <label htmlFor="unit">Mennyiség egysége</label>
                  <Dropdown
                    onChange={this.onDropdownChange}
                    name="unit"
                    value={edit.data.unit}
                    placeholder="Válassz a menüből"
                    fluid
                    selection
                    options={DropdownOptions.unitDropdownOptions}
                  />
                  {edit.errors.unit && <InlineError text={edit.errors.unit} />}
                </Form.Field>

                <Form.Field error={!!edit.errors.vat}>
                  <label htmlFor="vat">Áfa</label>
                  <Dropdown
                    value={edit.data.vat}
                    onChange={this.onDropdownChange}
                    name="vat"
                    placeholder="Válassz a menüből"
                    fluid
                    selection
                    options={DropdownOptions.vatDropdownOptions}
                  />
                  {edit.errors.vat && <InlineError text={edit.errors.vat} />}
                </Form.Field>

                <Form.Field error={!!edit.errors.profitPercent}>
                  <label htmlFor="profitPercent">Haszonkulcs (%)</label>
                  <input
                    type="text"
                    id="profitPercent"
                    name="profitPercent"
                    placeholder="profitPercent"
                    value={Math.round(edit.data.profitPercent * 100) / 100}
                    onChange={this.onChange}
                  />
                  {edit.errors.profitPercent && (
                    <InlineError text={edit.errors.profitPercent} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.netPurchasePrice}>
                  <label htmlFor="netPurchasePrice">Nettó beszerzési ár</label>
                  <input
                    type="text"
                    id="netPurchasePrice"
                    name="netPurchasePrice"
                    placeholder="netPurchasePrice"
                    value={Math.round(edit.data.netPurchasePrice * 100) / 100}
                    onChange={this.onChange}
                  />
                  {edit.errors.netPurchasePrice && (
                    <InlineError text={edit.errors.netPurchasePrice} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.grossPurchasePrice}>
                  <label htmlFor="grossPurchasePrice">
                    Bruttó beszerzési ár
                  </label>
                  <input
                    type="text"
                    id="grossPurchasePrice"
                    name="grossPurchasePrice"
                    placeholder="grossPurchasePrice"
                    value={Math.round(edit.data.grossPurchasePrice * 100) / 100}
                    onChange={this.onChange}
                  />
                  {edit.errors.grossPurchasePrice && (
                    <InlineError text={edit.errors.grossPurchasePrice} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.netSellPrice}>
                  <label htmlFor="netSellPrice">Nettó eladási ár</label>
                  <input
                    type="text"
                    id="netSellPrice"
                    name="netSellPrice"
                    placeholder="netSellPrice"
                    value={Math.round(edit.data.netSellPrice * 100) / 100}
                    onChange={this.onChange}
                  />
                  {edit.errors.netSellPrice && (
                    <InlineError text={edit.errors.netSellPrice} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.grossSellPrice}>
                  <label htmlFor="grossSellPrice">Bruttó eladási ár</label>
                  <input
                    type="text"
                    id="grossSellPrice"
                    name="grossSellPrice"
                    placeholder="grossSellPrice"
                    value={Math.round(edit.data.grossSellPrice * 100) / 100}
                    onChange={this.onChange}
                  />
                  {edit.errors.grossSellPrice && (
                    <InlineError text={edit.errors.grossSellPrice} />
                  )}
                </Form.Field>

                <Form.Field error={!!edit.errors.supplier}>
                  <label htmlFor="supplier">Beszállító</label>
                  <Dropdown
                    value={edit.data.supplier}
                    onChange={this.onDropdownChange}
                    name="supplier"
                    placeholder="Válassz a menüből"
                    fluid
                    selection
                    options={DropdownOptions.supplierDropdownOptions}
                  />
                  {edit.errors.supplier && (
                    <InlineError text={edit.errors.supplier} />
                  )}
                </Form.Field>

                {edit.errors.global && (
                  <Message negative>
                    <Message.Header>Valami hiba történt</Message.Header>
                    <p>{edit.errors.global}</p>
                  </Message>
                )}

                {edit.success && (
                  <Message positive>
                    <Message.Header>Termék mentésre került</Message.Header>
                    <p>A terméket sikeresen feltöltötted az adatbázisba</p>
                  </Message>
                )}

                <Button
                  style={{ marginBottom: "50px" }}
                  primary
                  sub="true"
                  onClick={() => {
                    this.setState({
                      confirm: { ...this.state.confirm, type: "módosítani" },
                    });
                  }}
                >
                  Mentés
                </Button>
                <Label
                  onClick={() =>
                    this.setState({
                      edit: { ...this.state.edit, data: {} },
                      isEditing: false,
                    })
                  }
                >
                  Módosítás elvetése
                </Label>
              </Form>
            </Segment>
          </div>
        )}

        <Segment>
          <Dimmer inverted active={loading}>
            <Loader />
          </Dimmer>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Sorszám</Table.HeaderCell>
                <Table.HeaderCell>Kép</Table.HeaderCell>
                <Table.HeaderCell onClick={this.sortNames}>
                  Termék neve {isSorted && <span>▼</span>}
                </Table.HeaderCell>
                <Table.HeaderCell>Mennyiség</Table.HeaderCell>
                <Table.HeaderCell>Min. mennyiség</Table.HeaderCell>
                <Table.HeaderCell>Beszerzés</Table.HeaderCell>
                <Table.HeaderCell>[Eszközök]</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>{tableRows}</Table.Body>
          </Table>
        </Segment>
      </div>
    );
  }
}

export default ItemsPage;
