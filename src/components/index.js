import React  from 'react'
import MedicineEntry from './medicineEntry';
import InfiniteScroll from "react-infinite-scroller";
import startFirebase from './config/firebaseConfig'
import logo from '../MA-Logo.jpg'
import { ref, set, get, update, remove, child } from 'firebase/database'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default class Crud extends React.Component {
    constructor(props) {
        super(props)
        this.expiryDateInputRef = React.createRef()
        this.expriyQuantity = React.createRef()
        this.state = {
            db: '',
            medicineUniqueID: 0,
            medicines: [],
            itemsPerPage: 5,
            hasMore: true,
            records: 0,
            showModal: false,
            loading: true,
            addMedicineExpiryUniqueID: 0,
            filterValues: {},
            filteredMedicines: {},
            filter: false
        }
    }

    componentDidMount() {
        this.setState({
            db: startFirebase()
        }, () => this.getMedicines())
    }
    getMedicines = () => {
        const dbref = ref(this.state.db)
        get(child(dbref, 'medicines/'))
        .then(snapshot => {
            if(snapshot.exists()) {
                this.setState({medicines: snapshot.val(), loading: false})
            }else{
                alert("No data found")
            }
        })
        .catch(err => {
            alert("Something went wrong, please try again")
        })
    }
    handleMedicineEntrySubmit = (formMedicineDetails, uniqueID) => {
        const {db, medicines, filteredMedicines} = this.state    
        if(uniqueID > 0) {
            const originalMedicineDetails = medicines[uniqueID]
            formMedicineDetails.expiryDate = originalMedicineDetails.expiryDate
            update(ref(db, 'medicines/'+uniqueID), formMedicineDetails)
            .then((res) => {
                medicines[uniqueID] = formMedicineDetails
                filteredMedicines[uniqueID] = formMedicineDetails
                document.body.style.overflow = 'unset'
                this.setState({showModal: false, medicines, filteredMedicines})
                alert('Data updated successfully')
            })
            .catch(err => {
                alert("Something went wrong, please try after sometime")
            })
        }else {
            uniqueID = Date.now()
            set(ref(db, 'medicines/' + uniqueID), formMedicineDetails)
            .then(res => {
                medicines[uniqueID] = formMedicineDetails
                document.body.style.overflow = 'unset'
                this.setState({medicines, showModal: false})
                alert('Medicine Entry Created')
            })
            .catch(err => {
                alert('Data error')
            })
        }
    }
    deleteMedicine = uniqueID => {
        const {db, medicines} = this.state
        if(window.confirm("Are you sure you want delete?")){
            remove(ref(db, 'medicines/'+uniqueID))
            .then(res => {
                delete medicines[uniqueID]
                document.body.style.overflow = 'unset'
                this.setState({showModal: false, medicines})
                alert("Medicine Entry deleted succsfully")
            })
            .catch(err => {
                alert("Something went wrong, please try after sometime")
            })
        }
    }
    handleExpiryDateEntry = (e, uniqueID) => {
        e.preventDefault()
        const {medicines, db} = this.state
        if(medicines[uniqueID]) {
            medicines[uniqueID]['expiryDate'].push(this.expiryDateInputRef.current.value)
            medicines[uniqueID]['quantity'] = parseInt(medicines[uniqueID]['quantity']) + parseInt(this.expriyQuantity.current.value)
            update(ref(db, 'medicines/'+uniqueID), medicines[uniqueID])
            .then((res) => {
                document.body.style.overflow = 'unset'
                this.setState({medicines, addMedicineExpiryUniqueID: 0})
                alert('Expiry Date Updated Successfully')
            })
            .catch(err => {
                alert("Something went wrong, please try after sometime")
            })
        }else{
            alert("No Data Found")
        }
    }
    handleDeleteExpiry = (uniqueID, index) => {
        const {medicines, db} = this.state
        if(medicines[uniqueID]) {
            const inputval = window.prompt("Quantity", 0)
            if(inputval === null)
                return;
            if(parseInt(inputval) >= 0 && medicines[uniqueID]['quantity'] > parseInt(inputval)) {
                medicines[uniqueID]['expiryDate'].splice(index,1)
                medicines[uniqueID]['quantity'] = parseInt(medicines[uniqueID]['quantity']) - parseInt(inputval)
                update(ref(db, 'medicines/'+uniqueID), medicines[uniqueID])
                .then((res) => {
                    this.setState({medicines})
                    alert('Expiry Date Deleted Successfully')
                })
                .catch(err => {
                    alert("Something went wrong, please try after sometime")
                })
            }else{
                alert("Please check and enter valid quantity")
            }
        }else{
            alert("No Data Found")
        }
    }
    showItems = () => {
        let {medicines, filteredMedicines, filter} = this.state
        medicines = filter ? filteredMedicines : medicines
        var items = [];
        Object.keys(medicines).forEach(medicine => {
            items.push(
                <tr key={medicine}>
                    <td onClick={() => this.toggleMOdal(medicine)}>{medicines[medicine].companyName}</td>
                    <td>{medicines[medicine].drugName}</td>
                    <td>
                        <table className='no-border'>
                            <tbody>
                                <tr>
                                    <td 
                                        colSpan={2} 
                                        align='right'
                                        >
                                        <span 
                                            onClick={() => this.toggleMOdal(medicine, 'expire')} 
                                            className='handle-expiry'
                                        >
                                            + Add
                                        </span>
                                    </td>
                                </tr>
                                {
                                    medicines[medicine].expiryDate.map((date, i) => {
                                        const dt = new Date(date)
                                        return <tr key={`medicine-expiry-${medicine}-${i}`}>
                                            <td className='text-nowrap'>{`${months[dt.getMonth()]}-${dt.getFullYear()}`}</td>
                                            <td align='right'>
                                                <span 
                                                    className='handle-expiry'
                                                    onClick={() => this.handleDeleteExpiry(medicine, i)}
                                                >
                                                    - Remove
                                                </span>
                                            </td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </td>
                    <td>
                       {/* <button className='btn btn-primary'>-</button>  */}
                       {medicines[medicine].quantity}
                       {/* <button className='btn btn-primary'>+</button> */}
                    </td>
                </tr>
            )
        })
        return items;
    }
    loadMore = () => {
        const {records, itemsPerPage} = this.state
        this.setState({
            records: records + itemsPerPage
        })
    }
    toggleMOdal = (uniqueID = 0, type = '') => {
        const {showModal} = this.state
        const updatedState = {}
        let overflow = 'unset'
        if(type === 'expire') {
            updatedState['addMedicineExpiryUniqueID'] = uniqueID
            overflow = uniqueID > 0 ? 'hidden' : 'unset'
        }else {
            updatedState['showModal'] = !showModal
            updatedState['medicineUniqueID'] = uniqueID
            overflow = !showModal ? 'hidden' : 'unset'
        }
        document.body.style.overflow = overflow
        window.scrollTo(0, 0)
        this.setState(updatedState)
    }
    handleFilterValues = e => {
        const {name, value} = e.target
        const {filterValues} = this.state
        filterValues[name] = value
        this.setState({filterValues})
    }
    filterMedicineCompanyName = medicineDetails => {
        const {filterCompanyName} = this.state.filterValues
        return filterCompanyName ?
                (medicineDetails.companyName.indexOf(filterCompanyName) >= 0 || 
                medicineDetails.drugName.indexOf(filterCompanyName) >= 0) : true
    }
    filterMedicineExpiryDate = medicineDetails => {
        const {filterExpiryDate, expiryFilterCondition} = this.state.filterValues
        if(!filterExpiryDate)
            return true
        const dt1 = new Date(filterExpiryDate)
        const month1 = dt1.getMonth()
        const year1 = dt1.getFullYear()
        let filterStatus = false
        medicineDetails.expiryDate.forEach(exdate => {
            const dt = new Date(exdate)
            const month = dt.getMonth()
            const year = dt.getFullYear()
            const condition = expiryFilterCondition || '='
            if(
                (condition === '=' && month === month1 && year === year1) ||
                (condition === '>' && dt > dt1) ||
                (condition === '<' && dt < dt1)
            )
                filterStatus = true
        })
        return filterStatus
    }
    filterMedicineQuantity = medicineDetails => {
        const {filterQuantity, quantityFilterCondition} = this.state.filterValues
        const condition1 = quantityFilterCondition || '='
        return filterQuantity && filterQuantity >= 0 ? (
            (condition1 === '=' && parseInt(medicineDetails.quantity) === parseInt(filterQuantity)) ||
            (condition1 === '>' && parseInt(medicineDetails.quantity) > parseInt(filterQuantity)) ||
            (condition1 === '<' && parseInt(medicineDetails.quantity) < parseInt(filterQuantity))
        ) : true
    }
    filterData = () => {
        const {medicines} = this.state
        const filteredMedicines = {}
        Object.keys(medicines).forEach(medicine => {
            const medicineDetails = medicines[medicine]
            if(this.filterMedicineCompanyName(medicineDetails) &&
                this.filterMedicineExpiryDate(medicineDetails) &&
                    this.filterMedicineQuantity(medicineDetails)
            )
                filteredMedicines[medicine] = medicineDetails
        })
        this.setState({filteredMedicines, filter: true})
    }
    render() {
        const {records, medicines} = this.state
        return (
            <>
            <header className='header-block'>
                    <img alt='malli-friends-logo' src={logo} className='logo-width'/>
                    <h4 className='m-0'>MalliFriends</h4>
                </header>
                <div className='p-15'>
                    <h2 className='text-center m-0'>
                        Sri Balaji Medical - Stock List
                    </h2>
                    <div className='text-right'>
                        <button 
                            className='btn btn-primary'
                            onClick={() => this.toggleMOdal()}
                        >
                            Add Medicine
                        </button>
                    </div>
                    <div style={{padding: '10px'}}>
                        <div className='row'>
                            <div className='col-md-3'>
                                <label>Company Name / Drug Name</label>
                                <input 
                                    onChange={this.handleFilterValues} 
                                    name='filterCompanyName' 
                                    placeholder='Company Name' 
                                    className='form-control'
                                />
                            </div>
                            <div className='col-md-3'>
                                <label>Expiry Date</label>
                                <select 
                                    onChange={this.handleFilterValues} 
                                    name='expiryFilterCondition' 
                                    className='margin-left-10' 
                                    style={{width: '30%'}}
                                >
                                    <option>{`=`}</option>
                                    <option>{`<`}</option>
                                    <option>{`>`}</option>
                                </select>
                                <input 
                                    type='date' 
                                    className='form-control'
                                    name='filterExpiryDate'
                                    onChange={this.handleFilterValues}
                                />
                            </div>
                            <div className='col-md-3'>
                                <label>Quantity</label>
                                <select 
                                    name='quantityFilterCondition' 
                                    className='margin-left-10' 
                                    style={{width: '30%'}}
                                    onChange={this.handleFilterValues}
                                >
                                    <option>{`=`}</option>
                                    <option>{`<`}</option>
                                    <option>{`>`}</option>
                                </select>
                                <input 
                                    type='number' 
                                    name='filterQuantity'
                                    min={0} 
                                    placeholder='Quantity' 
                                    className='form-control'
                                    onChange={this.handleFilterValues}
                                />
                            </div>
                            <div className='col-md-3' style={{marginTop: '25px'}}>
                                <button 
                                    onClick={this.filterData} 
                                    type='button' 
                                    className='btn btn-primary'
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style={{overflow: 'auto'}}>

                        <table>
                            <thead>
                                <tr>
                                    <th>Company Name</th>
                                    <th>Drug Name</th>
                                    <th>Expiry Date</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                                {
                                    this.state.loading ? <tbody>
                                                <tr>
                                                <td colSpan={4} align='center'>Loading...</td>
                                            </tr> 
                                        </tbody> :
                                    <InfiniteScroll
                                        pageStart={0}
                                        loadMore={this.loadMore}
                                        hasMore={records < medicines.length}
                                        loader={<h4 className="loader">Loading...</h4>}
                                        useWindow={false}
                                        element="tbody"
                                        isReverse={true}
                                        >
                                        {this.showItems()}
                                    </InfiniteScroll>
                                }
                        </table>
                    </div>
                    {
                        this.state.showModal &&
                            <div className='my-modal-body'>
                                <MedicineEntry 
                                    toggleMOdal={this.toggleMOdal}
                                    medicineDetails={
                                        this.state.medicineUniqueID > 0 ? 
                                            {...this.state.medicines[this.state.medicineUniqueID], uniqueID: this.state.medicineUniqueID} : null
                                    }
                                    deleteMedicine={this.deleteMedicine}
                                    handleMedicineEntrySubmit={this.handleMedicineEntrySubmit}
                                />
                            </div>
                    }
                    {
                        this.state.addMedicineExpiryUniqueID > 0 &&
                            <div className='my-modal-body'>
                                <div className='my-modal'>
                                    <h3>Add Expiry Date Entry</h3>
                                        <form onSubmit={e => this.handleExpiryDateEntry(e, this.state.addMedicineExpiryUniqueID)}>
                                            <div className="form-group">
                                                <label htmlFor="expiryDateInputRef">Expiry:</label>
                                                <input 
                                                    type="date" 
                                                    className="form-control" 
                                                    placeholder="Enter password" 
                                                    ref={this.expiryDateInputRef}
                                                    id='expiryDateInputRef'
                                                    name='expiryDateInputRef'
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="expriyQuantity">Quantity:</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    placeholder="Enter Quantity" 
                                                    ref={this.expriyQuantity}
                                                    id='expriyQuantity'
                                                    name='expriyQuantity'
                                                    required
                                                />
                                            </div>
                                            <div className='text-center'>
                                                <button type='submit' className='btn btn-primary'>
                                                    Add Entry
                                                </button>
                                                <button onClick={() => this.toggleMOdal(0, 'expire')}  type='button' className='btn btn-secondary margin-left-10'>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                </div>
                            </div>
                    }
                </div>
            </>
        )
    }
}