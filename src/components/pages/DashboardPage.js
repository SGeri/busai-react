import React from "react";
import axios from "axios";
import {
  Button,
  Table,
  Dimmer,
  Segment,
  Loader,
  Image,
  Label,
  Modal,
  Input,
  Message,
  Search,
} from "semantic-ui-react";
import BarcodeReader from "react-barcode-reader";

import Navbar from "../menus/Navbar";

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isSelling: true,

      itemTypes: [],
      data: [],

      success: false,
      loading: false,
      errors: {},

      isAdjusting: false,
      adjustItemPartNumber: null,
      adjustValue: 1,

      confirm: { open: false },

      search: {
        value: "",
        loading: false,
      },
    };

    this.handleScan = this.handleScan.bind(this);
  }

  async componentDidMount() {
    this.setState({ loading: true });
    await axios
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
        res.data.forEach((e) => (e.adjust = 1));

        this.setState({ itemTypes: res.data });
      });
    this.setState({ loading: false });
  }

  handleScan(data) {
    let scanRes = this.state.itemTypes.find((item) => item.barcode === data);

    if (this.state.data.length == 0) {
      this.setState({ data: [...this.state.data, scanRes] });
    } else {
      const updatedDataType = this.state.data.find(
        (item) => item.partNumber == scanRes.partNumber
      );

      if (updatedDataType) {
        updatedDataType.adjust++;
        this.setState({ data: [...this.state.data] });
      } else {
        this.setState({ data: [...this.state.data, scanRes] });
      }
    }
  }

  adjustStock() {
    this.setState({ isAdjusting: true, adjustValue: 1 });
  }

  onSearchChange = (e, data) => {
    this.setState({ search: { ...this.state.search, value: data.value } });

    let searchedItems = this.state.itemTypes.filter((item) => {
      return item.name.toLowerCase().includes(data.value.toLowerCase());
    });

    let editedSearchedItems = searchedItems.map((item) => {
      return { title: item.name, partNumber: item.partNumber };
    });

    if (data.value.length != 0) {
      this.setState({
        searchResults: editedSearchedItems,
      });
    } else {
      this.setState({
        searchResults: [],
      });
    }
  };

  selectFromSearch = (e, data) => {
    let scanRes = this.state.itemTypes.find(
      (item) => item.partNumber === data.result.partNumber
    );

    if (this.state.data.length == 0) {
      this.setState({ data: [...this.state.data, scanRes] });
    } else {
      const updatedDataType = this.state.data.find(
        (item) => item.partNumber == scanRes.partNumber
      );

      if (updatedDataType) {
        updatedDataType.adjust++;
        this.setState({ data: [...this.state.data] });
      } else {
        this.setState({ data: [...this.state.data, scanRes] });
      }
    }
  };

  onResultSelect = (e, data) => {
    console.log(data.value);
  };

  async submit() {
    let { data, isSelling } = this.state;

    await axios
      .post(
        "http://88.151.99.76:4000/api/adjust_stock",
        { data, isSelling },
        {
          headers: {
            Authorization: "Bearer " + localStorage.BUSAIWAREHOUSE_JWT,
          },
        }
      )
      .then((res) => {
        if (res.data.success) {
          this.setState({
            success: true,
            data: [],
          });
        } else {
          this.setState({
            success: false,
            errors: res.data.errors,
          });
        }
      });
  }

  render() {
    const {
      isSelling,
      loading,
      data,
      isAdjusting,
      adjustValue,
      confirm,
      search,
      searchResults,
    } = this.state;

    let tableRows = data.map((item, index) => {
      return (
        <Table.Row key={index}>
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
          <Table.Cell>
            {isSelling ? "-" : "+"}
            {item.adjust}
            <Label
              style={{ marginLeft: "10px" }}
              onClick={async () => {
                await this.setState({
                  adjustItemPartNumber: item.partNumber,
                  isAdjusting: true,
                });
                this.adjustStock();
              }}
            >
              +/-
            </Label>
          </Table.Cell>
          <Table.Cell>{item.netSellPrice} Ft</Table.Cell>
          <Table.Cell>{item.grossSellPrice} Ft</Table.Cell>
        </Table.Row>
      );
    });

    let overall = {
      netSellPrice: 0,
      grossSellPrice: 0,
      vat: 0,
    };
    this.state.data.forEach((item, index) => {
      overall.netSellPrice += Math.round(item.netSellPrice * item.adjust);
      overall.grossSellPrice += Math.round(item.grossSellPrice * item.adjust);
      overall.vat += Math.round(item.vat * item.adjust);
    });

    return (
      <div style={{ paddingBottom: "100px" }}>
        <Navbar />
        <h1>Főoldal</h1>

        <BarcodeReader onError={this.handleScan} onScan={this.handleScan} />

        <Modal open={confirm.open}>
          <Modal.Header>Megerősítés</Modal.Header>
          <Modal.Content>
            <h3>Biztosan folytatod a műveletet?</h3>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="black"
              onClick={() => {
                this.setState({
                  confirm: { open: false },
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
                this.submit();
                this.setState({
                  confirm: { open: false },
                });
              }}
              positive
            />
          </Modal.Actions>
        </Modal>

        <Modal open={isAdjusting}>
          <Modal.Header>Beszerzési / eladási mennyiség módosítása</Modal.Header>
          <Modal.Content>
            <h3>Új érték: </h3>
            <Input
              type="number"
              id="adjustValue"
              name="adjustValue"
              value={adjustValue}
              onChange={(e) => {
                this.setState({
                  adjustValue: e.target.value,
                });
              }}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              color="black"
              onClick={() => {
                this.setState({
                  isAdjusting: false,
                });
              }}
            >
              Mégsem
            </Button>
            <Button
              content="Igen"
              labelPosition="right"
              icon="checkmark"
              onClick={async () => {
                if (this.state.adjustValue > 0) {
                  var s = data.find(
                    (item) =>
                      item.partNumber === this.state.adjustItemPartNumber
                  );

                  if (this.state.isSelling) {
                    if (this.state.adjustValue <= s.stock) {
                      let edited = this.state.data.filter(function (value) {
                        return value != s;
                      });

                      s.adjust = await parseInt(this.state.adjustValue);
                      edited.push(s);

                      this.setState({
                        data: edited,
                        isAdjusting: false,
                      });
                    } else {
                      alert("Nincs ennyi ebből a termékből raktáron!");
                    }
                  } else {
                    let edited = this.state.data.filter(function (value) {
                      return value != s;
                    });

                    s.adjust = await parseInt(this.state.adjustValue);
                    edited.push(s);

                    this.setState({
                      data: edited,
                      isAdjusting: false,
                    });
                  }
                } else {
                  alert("A szám nem lehet negatív vagy nulla!");
                }
              }}
              positive
            />
          </Modal.Actions>
        </Modal>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "50px",
          }}
        >
          <Button
            primary={!isSelling}
            onClick={() => {
              this.setState({ data: [], isSelling: false });
            }}
            style={{ marginRight: "10px", padding: "40px" }}
          >
            <p style={{ fontSize: 24 }}>Bevételezés</p>
          </Button>
          <Button
            primary={isSelling}
            onClick={() => {
              this.setState({ data: [], isSelling: true });
            }}
            style={{
              padding: "40px",
              paddingLeft: "65px",
              paddingRight: "65px",
            }}
          >
            <p style={{ fontSize: 24 }}>Eladás</p>
          </Button>
        </div>

        <Search
          style={{ width: "40%" }}
          placeholder={"Hozzáadás név alapján"}
          loading={search.loading}
          onSearchChange={this.onSearchChange}
          value={search.value}
          onResultSelect={this.selectFromSearch}
          results={searchResults}
        />

        <Segment>
          <Dimmer inverted active={loading}>
            <Loader />
          </Dimmer>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Kép</Table.HeaderCell>
                <Table.HeaderCell>Termék neve</Table.HeaderCell>
                <Table.HeaderCell>Jelenlegi készlet</Table.HeaderCell>
                <Table.HeaderCell>Min. mennyiség</Table.HeaderCell>
                <Table.HeaderCell>Változás</Table.HeaderCell>
                <Table.HeaderCell>Nettó eladási ár</Table.HeaderCell>
                <Table.HeaderCell>Bruttó eladási ár</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>{tableRows}</Table.Body>
          </Table>
        </Segment>

        {isSelling && (
          <div>
            <h3>Végösszeg</h3>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Nettó eladási ár</Table.HeaderCell>
                  <Table.HeaderCell>Bruttó eladási ár</Table.HeaderCell>
                  <Table.HeaderCell>ÁFA</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>{overall.netSellPrice} Ft</Table.Cell>
                  <Table.Cell>{overall.grossSellPrice} Ft</Table.Cell>
                  <Table.Cell>{overall.vat} Ft</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        )}

        {this.state.data.length != 0 && (
          <div>
            <Button
              style={{ marginTop: "20px" }}
              primary
              sub="true"
              onClick={() => this.setState({ confirm: { open: true } })}
            >
              Mentés
            </Button>
            <Label
              style={{ marginLeft: "10px" }}
              onClick={() => this.setState({ data: [], isSelling: false })}
            >
              Mégsem
            </Label>
          </div>
        )}

        {this.state.success && (
          <Message positive>
            <Message.Header>Mentés sikeres</Message.Header>
            <p>A terméke(ke)t sikeresen mentetted az adatbázisban</p>
          </Message>
        )}

        {this.state.errors.global && (
          <Message negative>
            <Message.Header>Valami hiba történt</Message.Header>
            <p>{this.state.errors.global}</p>
          </Message>
        )}
      </div>
    );
  }
}

export default DashboardPage;
